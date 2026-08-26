# Katia Arnaut Estética

Website oficial da Katia Arnaut Estética — clínica de estética facial em Benfica, Lisboa.

## Stack
- Node.js + Express
- EJS (templates)
- PostgreSQL (Neon)
- express-session + connect-pg-simple
- bcrypt (autenticação)

## Funcionalidades
- Site institucional bilingue (PT/EN)
- Sistema de marcação de consultas (pendente → aceite/recusada pelo admin)
- Painel de gestão (`/gestao`) — marcações, tratamentos, horário, equipa, sugestões
- Assistente virtual (chatbot com FAQ bilingue)
- Autenticação de clientes (registo, login, histórico de marcações)

## Variáveis de ambiente
Ver `.env.example`.

## Arranque local
```
npm install
npm start
```

O servidor cria automaticamente as tabelas na base de dados no arranque, se ainda não existirem.
