# minicambio-web

Frontend React do MiniCâmbio, um sistema de câmbio simplificado usado como projeto de estudo.
Permite listar, consultar, criar, confirmar e cancelar ordens de câmbio, conversando apenas com o serviço Orders.

## Telas

- `/orders`: lista das ordens, da mais recente para a mais antiga, com data, moeda, operação (Compra/Venda),
  valor estrangeiro, valor em BRL, status e ações ("Ver detalhes"; "Cancelar" só quando a ordem ainda pode ser
  cancelada). Filtro por status e paginação ficam na query string (`?status=Completed&page=2`), então o link pode
  ser compartilhado e o botão voltar funciona. A lista se atualiza sozinha a cada 5 s enquanto houver na página
  alguma ordem que ainda pode mudar de status.
- `/orders/new`: formulário de criação (moeda, operação, valor, beneficiário, país e conta). A validação espelha a do
  backend (valor > 0 com até 2 casas, nome até 120 e conta até 34 caracteres); erros 400 do Orders aparecem no campo
  correspondente e os demais acima do formulário. Cada formulário gera um `Idempotency-Key` e o reutiliza se o
  mesmo envio for repetido (duplo clique, nova tentativa após erro); depois do sucesso vai para os detalhes.
- `/orders/:id`: resumo da ordem, cotação, beneficiário e status. Enquanto `Quoted`, mostra a contagem regressiva da
  cotação (60 s) com os botões "Confirmar ordem" e "Cancelar ordem" conforme `canConfirm`/`canCancel` devolvidos
  pela API. Atualiza a cada 3 s até a ordem chegar a um status final e explica o motivo quando o pagamento falha.
- `/`: redireciona para `/orders`.

O cancelamento sempre pede confirmação num `<dialog>` nativo (foco inicial em "Voltar", Esc fecha, o foco volta
para o botão que abriu). Mudanças de status e resultados de ações são anunciados numa região `aria-live="polite"`.

### Como testar os cenários do mock pela interface

| Cenário               | Como criar a ordem                       | Resultado esperado após confirmar                |
| --------------------- | ---------------------------------------- | ------------------------------------------------ |
| Sucesso               | qualquer beneficiário/país comum         | `Concluída` em poucos segundos                   |
| Beneficiário recusado | nome contendo `FAIL` (ex.: `FAIL Teste`) | `Falhou` — beneficiário recusado                 |
| Compliance            | país Coreia do Norte ou Irã              | `Falhou` — bloqueio de compliance                |
| Limite                | valor acima de 100.000                   | `Falhou` — limite excedido                       |
| Cotação expirada      | espere os 60 s sem confirmar             | `Expirada` (o botão de confirmar é desabilitado) |
| Cancelamento          | "Cancelar ordem" numa ordem `Cotada`     | `Cancelada`                                      |

## Requisitos

- Node 24 LTS (com nvm-windows: `nvm use 24.9.0`)

## Comandos

```powershell
npm install
npm run dev           # servidor de desenvolvimento do Vite (http://localhost:5173)
npm run build         # checagem de tipos + build de produção em dist/
npm run preview       # serve o build de produção localmente
npm test              # testes (Vitest + Testing Library + MSW)
npm run test:watch    # testes em modo watch
npm run lint          # ESLint (react-hooks + jsx-a11y)
npm run format        # Prettier
npm run typecheck     # checagem de tipos
```

Em desenvolvimento, o Vite encaminha `/api` para `http://localhost:5000`, onde o Orders sobe com `dotnet run`.
O frontend sempre usa caminho relativo (`/api/v1/...`), então nenhuma URL de backend fica embutida no build e a
mesma imagem serve qualquer ambiente.

> O `eslint-plugin-jsx-a11y` ainda declara suporte só até o ESLint 9; o `overrides` do `package.json` o libera para o
> ESLint 10 usado no projeto.

## Estrutura

```
src/
├── app/                 # App, rotas, QueryClient, providers e layout
├── features/orders/
│   ├── api/             # ordersApi (HTTP), types (contratos do Orders), queries (TanStack Query)
│   ├── components/      # OrdersTable, OrderStatusBadge, OrderForm, OrderSummary, QuoteCountdown, ...
│   ├── pages/           # OrdersListPage, CreateOrderPage, OrderDetailsPage
│   └── schemas/         # createOrderSchema (Zod)
├── shared/              # httpClient/ApiError, componentes genéricos, hooks e utilitários
└── test/                # setup do Vitest, servidor MSW, handlers e fábricas de dados
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
