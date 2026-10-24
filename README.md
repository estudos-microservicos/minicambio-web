# minicambio-web

Frontend React do MiniCâmbio, um sistema de câmbio simplificado usado como projeto de estudo.
Permite listar, consultar, criar, confirmar e cancelar ordens de câmbio, conversando apenas com o serviço Orders.

> Repositório em construção (Fase 0: estrutura). Telas, testes e container entram nas próximas fases.

## Requisitos

- Node 24 LTS (com nvm-windows: `nvm use 24.9.0`)

## Comandos

```powershell
npm install
npm run dev     # servidor de desenvolvimento do Vite
npm run build   # checagem de tipos + build de produção em dist/
npm run lint    # ESLint
```

## Docker

```powershell
docker build -t minicambio-web .
docker run --rm -p 3000:8080 -e ORDERS_API_URL=http://orders-api:8080 minicambio-web
```

A imagem final é um nginx não-root na porta `8080` que serve o build estático e encaminha `/api/*` para
`ORDERS_API_URL` (padrão `http://orders-api:8080`). A configuração fica em `nginx/default.conf.template`.
O nginx só sobe se conseguir resolver o host de `ORDERS_API_URL`, então o jeito normal de rodar é pelo
`docker-compose.yml` do repositório `minicambio-infra`.

Endpoints do container:

- `/healthz`: verificação de saúde (200)
- `/api/*`: proxy para o Orders
- qualquer outra rota: arquivos estáticos, com fallback para `index.html` (rotas do React Router)
