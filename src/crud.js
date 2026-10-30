const express = require('express');
const pool = require('./db');

function erro(res, e) {
  if (e.code === '23503') return res.status(400).json({ erro: 'Referência inválida: registro relacionado não existe' });
  if (e.code === '23505') return res.status(409).json({ erro: 'Registro duplicado' });
  if (e.code === '23502') return res.status(400).json({ erro: 'Campo obrigatório ausente' });
  if (e.code === '22P02') return res.status(400).json({ erro: 'Valor inválido' });
  res.status(500).json({ erro: e.message });
}

function crud(table, columns) {
  const router = express.Router();

  router.get('/', async (req, res) => {
    try {
      const filtros = Object.keys(req.query).filter((k) => columns.includes(k));
      const where = filtros.map((k, i) => `${k} = $${i + 1}`).join(' AND ');
      const sql = `SELECT * FROM ${table}${where ? ' WHERE ' + where : ''} ORDER BY id`;
      const { rows } = await pool.query(sql, filtros.map((k) => req.query[k]));
      res.json(rows);
    } catch (e) { erro(res, e); }
  });

  router.get('/:id', async (req, res) => {
    try {
      const { rows } = await pool.query(`SELECT * FROM ${table} WHERE id = $1`, [req.params.id]);
      rows[0] ? res.json(rows[0]) : res.status(404).json({ erro: 'Não encontrado' });
    } catch (e) { erro(res, e); }
  });

  router.post('/', async (req, res) => {
    try {
      const cols = columns.filter((c) => req.body[c] !== undefined);
      if (!cols.length) return res.status(400).json({ erro: 'Corpo vazio' });
      const marcadores = cols.map((_, i) => `$${i + 1}`).join(', ');
      const { rows } = await pool.query(
        `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${marcadores}) RETURNING *`,
        cols.map((c) => req.body[c])
      );
      res.status(201).json(rows[0]);
    } catch (e) { erro(res, e); }
  });

  router.put('/:id', async (req, res) => {
    try {
      const cols = columns.filter((c) => req.body[c] !== undefined);
      if (!cols.length) return res.status(400).json({ erro: 'Corpo vazio' });
      const sets = cols.map((c, i) => `${c} = $${i + 1}`).join(', ');
      const { rows } = await pool.query(
        `UPDATE ${table} SET ${sets} WHERE id = $${cols.length + 1} RETURNING *`,
        [...cols.map((c) => req.body[c]), req.params.id]
      );
      rows[0] ? res.json(rows[0]) : res.status(404).json({ erro: 'Não encontrado' });
    } catch (e) { erro(res, e); }
  });

  router.delete('/:id', async (req, res) => {
    try {
      const { rows } = await pool.query(`DELETE FROM ${table} WHERE id = $1 RETURNING *`, [req.params.id]);
      rows[0] ? res.json({ mensagem: 'Removido', removido: rows[0] }) : res.status(404).json({ erro: 'Não encontrado' });
    } catch (e) { erro(res, e); }
  });

  return router;
}

module.exports = crud;
module.exports.erro = erro;