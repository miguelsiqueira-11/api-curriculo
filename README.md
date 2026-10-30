# API Currículo

API REST de currículo com Node.js, Express e PostgreSQL (Neon). junto a um Deploy no Vercel.

## Entidades
- pessoas, formacoes, experiencias, projetos, habilidades (CRUD completo)
- Relacionamentos: pessoa 1:N formações/experiências/projetos; pessoa N:N habilidades

## Rotas principais
- `GET/POST /pessoas`, `GET/PUT/DELETE /pessoas/:id`
- `GET /pessoas/:id/completo`
- `GET /pessoas/:id/formacoes | experiencias | projetos | habilidades`
- `POST/PUT/DELETE /pessoas/:id/habilidades/:habilidadeId`
- Mesmo CRUD em `/formacoes`, `/experiencias`, `/projetos`, `/habilidades`

## Como rodar
1. `npm install`
2. Criar `.env` com `DATABASE_URL=<connection string do Neon>`
3. `node server.js`
