# Deploy

O app esta pronto para deploy estatico.

## Vercel

1. Importe a pasta `landing-preview` como projeto Vite.
2. Confirme:
   - Build command: `npm run build`
   - Output directory: `dist`
3. Publique.

O arquivo `vercel.json` ja deixa essa configuracao explicita.

## Netlify

1. Crie um novo site a partir do repositorio.
2. Use:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`
3. Configure as variaveis:
   - `PLUGGY_CLIENT_ID`
   - `PLUGGY_CLIENT_SECRET`
4. Publique.

O arquivo `netlify.toml` ja inclui o redirect de SPA para `index.html` e a pasta de funcoes.

## Observacoes

- O dashboard continua funcionando em modo demo com dados estaticos de `public/`.
- O MVP conectado usa funcoes Netlify para proteger as credenciais do Pluggy.
- O modo conectado nao funciona em upload manual apenas da pasta `dist` ou do `netlify-deploy.zip`, porque esse fluxo publica so os assets estaticos e nao sobe `netlify/functions`.
- Para Open Finance funcionar, publique pelo repositorio conectado ao Netlify.
- O fluxo conectado e:
  - `pluggy-connect-token` para abrir o widget
  - `pluggy-sync` para buscar contas e transacoes
  - `pluggy-disconnect` para apagar o item conectado
- Antes de publicar, valide localmente com `npm run build` e `npm run preview`.
