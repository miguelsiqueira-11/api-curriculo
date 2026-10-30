const app = require('./src/app');

const server = app.listen(3001, async () => {
  const base = 'http://localhost:3001';
  const req = async (metodo, caminho, corpo) => {
    const r = await fetch(base + caminho, {
      method: metodo,
      headers: { 'Content-Type': 'application/json' },
      body: corpo ? JSON.stringify(corpo) : undefined,
    });
    const dados = await r.json().catch(() => null);
    console.log(metodo.padEnd(7), caminho.padEnd(34), r.status);
    return dados;
  };

  try {
    await req('GET', '/pessoas');
    await req('GET', '/pessoas/1/completo');
    await req('GET', '/pessoas/2/formacoes');
    await req('GET', '/pessoas/1/habilidades');
    await req('GET', '/projetos?pessoa_id=2');

    const novo = await req('POST', '/projetos', { pessoa_id: 1, nome: 'Teste', ano: 2026 });
    await req('PUT', `/projetos/${novo.id}`, { nome: 'Teste editado' });
    await req('GET', `/projetos/${novo.id}`);
    await req('DELETE', `/projetos/${novo.id}`);
    await req('GET', `/projetos/${novo.id}`);

    await req('POST', '/projetos', { pessoa_id: 999, nome: 'X' });
    await req('POST', '/pessoas/1/habilidades/4', { nivel: 'Básico' });
    await req('PUT', '/pessoas/1/habilidades/4', { nivel: 'Intermediário' });
    await req('DELETE', '/pessoas/1/habilidades/4');
  } catch (e) {
    console.log('ERRO:', e.message);
  }
  server.close();
  process.exit();
});

