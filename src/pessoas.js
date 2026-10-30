const express = require('express');
const pool = require('./db');
const crud = require('./crud');
const { erro } = require('./crud');

const router = express.Router();

// 1:N -> /pessoas/:id/formacoes, /experiencias, /projetos
['formacoes', 'experiencias', 'projetos'].forEach((tabela) => {
  router.get(`/:id/${tabela}`, async (req, res) => {
    try {
      const { rows } = await pool.query(`SELECT * FROM ${tabela} WHERE pessoa_id = $1 ORDER BY id`, [req.params.id]);
      res.json(rows);
    } catch (e) { erro(res, e); }
  });
});

// N:N -> habilidades da pessoa
router.get('/:id/habilidades', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT h.*, ph.nivel FROM habilidades h
       JOIN pessoa_habilidades ph ON ph.habilidade_id = h.id
       WHERE ph.pessoa_id = $1 ORDER BY h.id`, [req.params.id]);
    res.json(rows);
  } catch (e) { erro(res, e); }
});

router.post('/:id/habilidades/:habId', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'INSERT INTO pessoa_habilidades (pessoa_id, habilidade_id, nivel) VALUES ($1, $2, $3) RETURNING *',
      [req.params.id, req.params.habId, req.body.nivel || null]);
    res.status(201).json(rows[0]);
  } catch (e) { erro(res, e); }
});

router.put('/:id/habilidades/:habId', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'UPDATE pessoa_habilidades SET nivel = $1 WHERE pessoa_id = $2 AND habilidade_id = $3 RETURNING *',
      [req.body.nivel, req.params.id, req.params.habId]);
    rows[0] ? res.json(rows[0]) : res.status(404).json({ erro: 'Vínculo não encontrado' });
  } catch (e) { erro(res, e); }
});

router.delete('/:id/habilidades/:habId', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'DELETE FROM pessoa_habilidades WHERE pessoa_id = $1 AND habilidade_id = $2 RETURNING *',
      [req.params.id, req.params.habId]);
    rows[0] ? res.json({ mensagem: 'Vínculo removido' }) : res.status(404).json({ erro: 'Vínculo não encontrado' });
  } catch (e) { erro(res, e); }
});

// Currículo completo
router.get('/:id/completo', async (req, res) => {
  try {
    const id = req.params.id;
    const pessoa = await pool.query('SELECT * FROM pessoas WHERE id = $1', [id]);
    if (!pessoa.rows[0]) return res.status(404).json({ erro: 'Pessoa não encontrada' });
    const [formacoes, experiencias, projetos, habilidades] = await Promise.all([
      pool.query('SELECT * FROM formacoes WHERE pessoa_id = $1 ORDER BY id', [id]),
      pool.query('SELECT * FROM experiencias WHERE pessoa_id = $1 ORDER BY id', [id]),
      pool.query('SELECT * FROM projetos WHERE pessoa_id = $1 ORDER BY id', [id]),
      pool.query(`SELECT h.*, ph.nivel FROM habilidades h
                  JOIN pessoa_habilidades ph ON ph.habilidade_id = h.id
                  WHERE ph.pessoa_id = $1`, [id]),
    ]);
    res.json({
      ...pessoa.rows[0],
      formacoes: formacoes.rows,
      experiencias: experiencias.rows,
      projetos: projetos.rows,
      habilidades: habilidades.rows,
    });
  } catch (e) { erro(res, e); }
});

router.use('/', crud('pessoas', ['nome', 'titulo', 'email', 'telefone', 'cidade', 'resumo', 'github', 'linkedin']));

module.exports = router;