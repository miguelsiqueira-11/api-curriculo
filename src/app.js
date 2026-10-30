const express = require('express');
const cors = require('cors');
const crud = require('./crud');
const pessoas = require('./pessoas');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.json({ status: 'API Currículo no ar' }));

app.use('/pessoas', pessoas);
app.use('/formacoes', crud('formacoes', ['pessoa_id', 'instituicao', 'curso', 'nivel', 'data_inicio', 'data_fim', 'descricao']));
app.use('/experiencias', crud('experiencias', ['pessoa_id', 'empresa', 'cargo', 'data_inicio', 'data_fim', 'descricao']));
app.use('/projetos', crud('projetos', ['pessoa_id', 'nome', 'descricao', 'link_repositorio', 'link_demo', 'ano']));
app.use('/habilidades', crud('habilidades', ['nome', 'categoria']));

module.exports = app;