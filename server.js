const app = require('./src/app');
const porta = process.env.PORT || 3000;
app.listen(porta, () => console.log(`Rodando em http://localhost:${porta}`));