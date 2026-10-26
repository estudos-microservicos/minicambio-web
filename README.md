# minicambio-web

Frontend React do MiniCâmbio, um sistema de câmbio simplificado usado como projeto de estudo.
Permite listar, consultar, criar, confirmar e cancelar ordens de câmbio, conversando apenas com o serviço Orders.

> Repositório em construção. Já existe a tela de lista de ordens; criação, detalhes, confirmação e
> cancelamento entram na Fase 4.

## Telas

- `/orders`: lista das ordens, da mais recente para a mais antiga, com data, moeda, operação (Compra/Venda),
  valor estrangeiro, valor em BRL e status. Tem filtro por status e paginação, os dois refletidos na query string
  (`?status=Completed&page=2`), então o link pode ser compartilhado e o botão voltar funciona. A lista se atualiza
  sozinha a cada 5 s enquanto houver na página alguma ordem que ainda pode mudar de status.
- `/`: redireciona para `/orders`.

Enquanto o Orders não implementar `GET /api/v1/orders` (Fase 3), a tela mostra o estado de erro
("Não foi possível carregar as ordens.") com o botão "Tentar novamente".

## Requisitos

- Node 24 LTS (com nvm-windows: `nvm use 24.9.0`)

## Comandos

```powershell
npm install
npm run dev         # servidor de desenvolvimento do Vite (http://localhost:5173)
npm run build       # checagem de tipos + build de produção em dist/
npm test            # testes (Vitest + Testing Library + MSW)
npm run test:watch  # testes em modo watch
npm run lint        # ESLint
npm run typecheck   # checagem de tipos
```

Em desenvolvimento, o Vite encaminha `/api` para `http://localhost:5000`, onde o Orders sobe com `dotnet run`.
O frontend sempre usa caminho relativo (`/api/v1/...`), então nenhuma URL de backend fica embutida no build.

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
