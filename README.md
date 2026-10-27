# SS Celulares

Protótipo de vitrine responsiva para a SS Celulares. A versão estática pode ser publicada no GitHub Pages e não depende de Python, Flask ou SQLite para exibir o catálogo demonstrativo.

## Visualizar localmente

1. Baixe ou clone o repositório.
2. Abra o arquivo `index.html` no navegador, ou use a extensão **Live Server** no VS Code.
3. Para testar, pesquise produtos e use os filtros de categoria.

## Publicar no GitHub Pages

O workflow em `.github/workflows/pages.yml` prepara e publica a versão estática quando há push na branch principal.

1. Abra **Settings → Pages** no repositório.
2. Em **Build and deployment**, selecione **GitHub Actions** como origem.
3. Revise e integre a branch `feat/github-pages-design` na `main`.
4. O workflow executará na `main`; acompanhe o resultado pela aba **Actions**.
5. Quando a execução terminar com sucesso, abra o link exibido no workflow.

URL esperada do projeto: https://kyrsthen.github.io/Prototipo_S.S.Celulares/

## Estrutura

- `index.html`: estrutura semântica da página.
- `assets/css/style.css`: cores, layout responsivo, componentes e acessibilidade.
- `assets/js/catalogo.js`: catálogo demonstrativo, busca e filtros.
- `app.py`, `templates/` e `database.db`: versão Flask original, mantida no repositório. O GitHub Pages não executa essa aplicação Python nem o banco SQLite.

## Personalizar catálogo

Edite o array `produtos` em `assets/js/catalogo.js`. Os preços e produtos atuais são exemplos fictícios; substitua-os por informações reais e verificadas antes de divulgar a página como loja.

## Nota

Esta versão é uma vitrine estática. Pesquisa e filtros funcionam no navegador, mas não há login, checkout, pedidos ou acesso ao SQLite. Para essas funções, mantenha a aplicação Flask em um serviço que suporte backend ou crie uma API separada.
