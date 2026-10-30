const produtos = [
  {id:"capinha-universal",nome:"Capinha para celular",categoria:"Proteção",classe:"acessorio",cor:"black",descricao:"Exemplo de capa protetora. Consulte modelos compatíveis.",preco:49.90,acessorio:true},
  {id:"pelicula-protecao",nome:"Película de proteção",categoria:"Proteção",classe:"acessorio",cor:"blue",descricao:"Exemplo de película. Confirme a compatibilidade com seu aparelho.",preco:29.90,acessorio:true},
  {id:"carregador-usb",nome:"Carregador",categoria:"Energia",classe:"acessorio",cor:"white",descricao:"Exemplo de carregador. Consulte potência e compatibilidade.",preco:79.90,acessorio:true},
  {id:"cabo-usb",nome:"Cabo para carregamento",categoria:"Energia",classe:"acessorio",cor:"black",descricao:"Exemplo de cabo para dispositivos compatíveis.",preco:24.90,acessorio:true},
  {id:"fone-ouvido",nome:"Fone de ouvido",categoria:"Áudio",classe:"acessorio",cor:"black",descricao:"Exemplo de acessório de áudio. Consulte versões disponíveis.",preco:89.90,acessorio:true},
  {id:"caixa-som",nome:"Caixinha de som",categoria:"Áudio",classe:"acessorio",cor:"blue",descricao:"Exemplo de caixa de som portátil. Consulte disponibilidade.",preco:119.90,acessorio:true}
];

const CHAVE_CARRINHO = "ss-celulares-carrinho-v1";
const QUANTIDADE_MAXIMA = 99;
let carrinhoTemporario = [];
const dinheiro = valor => Number(valor || 0).toLocaleString("pt-BR", {style:"currency",currency:"BRL"});

function normalizarCarrinho(dados) {
  if (!Array.isArray(dados)) return [];
  return dados
    .filter(item => item && typeof item.id === "string" &&
      produtos.some(produto => produto.id === item.id) &&
      Number.isSafeInteger(item.quantidade) &&
      item.quantidade > 0 && item.quantidade <= QUANTIDADE_MAXIMA)
    .map(item => ({id:item.id, quantidade:item.quantidade}));
}
function lerCarrinho() {
  try {
    const dados = localStorage.getItem(CHAVE_CARRINHO);
    if (dados === null) return normalizarCarrinho(carrinhoTemporario);
    const carrinho = normalizarCarrinho(JSON.parse(dados));
    carrinhoTemporario = carrinho;
    return carrinho;
  } catch {
    return normalizarCarrinho(carrinhoTemporario);
  }
}
function salvarCarrinho(carrinho) {
  carrinhoTemporario = normalizarCarrinho(carrinho);
  try {
    localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(carrinhoTemporario));
  } catch {
    // O carrinho continua funcionando durante esta sessão se o navegador bloquear o armazenamento.
  }
  atualizarIndicadoresCarrinho();
}
function quantidadeCarrinho() {
  return lerCarrinho().reduce((total,item) => total + item.quantidade, 0);
}
function atualizarIndicadoresCarrinho() {
  const total = quantidadeCarrinho();
  document.querySelectorAll("[data-contador-carrinho]").forEach(el => {
    el.textContent = String(total);
    el.hidden = total === 0;
    el.setAttribute("aria-label", total + (total === 1 ? " item no carrinho" : " itens no carrinho"));
  });
}
function adicionarAoCarrinho(id) {
  const produto = produtos.find(item => item.id === id);
  if (!produto) return;
  const carrinho = lerCarrinho();
  const existente = carrinho.find(item => item.id === id);
  if (existente) {
    if (existente.quantidade >= QUANTIDADE_MAXIMA) {
      const mensagemLimite = document.querySelector("#mensagem-carrinho");
      if (mensagemLimite) mensagemLimite.textContent = "Limite de " + QUANTIDADE_MAXIMA + " unidades por produto no carrinho demonstrativo.";
      return;
    }
    existente.quantidade += 1;
  } else carrinho.push({id,quantidade:1});
  salvarCarrinho(carrinho);
  const mensagem = document.querySelector("#mensagem-carrinho");
  if (mensagem) mensagem.textContent = produto.nome + " adicionado ao carrinho.";
}
function desenharCarrinho() {
  const lista = document.querySelector("#itens-carrinho");
  if (!lista) return;
  const carrinho = lerCarrinho();
  lista.replaceChildren();
  const vazio = document.querySelector("#carrinho-vazio");
  const conteudo = document.querySelector("#carrinho-conteudo");
  const resumo = document.querySelector("#resumo-carrinho");
  const subtotalEl = document.querySelector("#subtotal-carrinho");
  const totalEl = document.querySelector("#total-carrinho");
  const contadorEl = document.querySelector("#total-itens-carrinho");
  const temItens = carrinho.length > 0;
  if (vazio) vazio.hidden = temItens;
  if (conteudo) conteudo.hidden = !temItens;
  if (resumo) resumo.hidden = !temItens;
  let subtotal = 0;
  carrinho.forEach(item => {
    const produto = produtos.find(p => p.id === item.id);
    if (!produto) return;
    subtotal += produto.preco * item.quantidade;
    const linha = document.createElement("article");
    linha.className = "item-carrinho";
    const info = document.createElement("div");
    info.className = "item-carrinho-info";
    const nome = document.createElement("h2");
    nome.textContent = produto.nome;
    const categoria = document.createElement("p");
    categoria.textContent = produto.categoria + " · " + dinheiro(produto.preco) + " por unidade";
    info.append(nome,categoria);
    const controles = document.createElement("div");
    controles.className = "item-carrinho-controles";
    const menos = document.createElement("button");
    menos.type = "button"; menos.className = "quantidade-botao"; menos.textContent = "−";
    menos.setAttribute("aria-label","Diminuir quantidade de " + produto.nome);
    menos.addEventListener("click",() => alterarQuantidade(produto.id,-1));
    const quantidade = document.createElement("span");
    quantidade.textContent = String(item.quantidade);
    quantidade.setAttribute("aria-label","Quantidade");
    const mais = document.createElement("button");
    mais.type = "button"; mais.className = "quantidade-botao"; mais.textContent = "+";
    mais.setAttribute("aria-label","Aumentar quantidade de " + produto.nome);
    mais.addEventListener("click",() => alterarQuantidade(produto.id,1));
    const preco = document.createElement("strong");
    preco.className = "item-carrinho-preco";
    preco.textContent = dinheiro(produto.preco * item.quantidade);
    const remover = document.createElement("button");
    remover.type = "button"; remover.className = "remover-item"; remover.textContent = "Remover";
    remover.addEventListener("click",() => removerDoCarrinho(produto.id));
    controles.append(menos,quantidade,mais);
    linha.append(info,controles,preco,remover);
    lista.append(linha);
  });
  if (subtotalEl) subtotalEl.textContent = dinheiro(subtotal);
  if (totalEl) totalEl.textContent = dinheiro(subtotal);
  if (contadorEl) contadorEl.textContent = String(quantidadeCarrinho());
  atualizarIndicadoresCarrinho();
}
function alterarQuantidade(id,delta) {
  const carrinho = lerCarrinho();
  const item = carrinho.find(produto => produto.id === id);
  if (!item) return;
  item.quantidade = Math.min(QUANTIDADE_MAXIMA, item.quantidade + delta);
  salvarCarrinho(carrinho.filter(produto => produto.quantidade > 0));
  desenharCarrinho();
}
function removerDoCarrinho(id) {
  salvarCarrinho(lerCarrinho().filter(item => item.id !== id));
  desenharCarrinho();
}
function desenharProdutos() {
  const lista = document.querySelector("#lista-produtos");
  const busca = document.querySelector("#busca");
  const contador = document.querySelector("#contador-produtos");
  if (!lista || !busca || !contador) return;
  const filtros = [...document.querySelectorAll("[data-categoria]")];
  const categoriaAtiva = filtros.find(botao => botao.getAttribute("aria-pressed") === "true")?.dataset.categoria || "Todos";
  const termo = busca.value.trim().toLocaleLowerCase("pt-BR");
  let encontrados = produtos.filter(produto =>
    (categoriaAtiva === "Todos" || produto.categoria === categoriaAtiva) &&
    (produto.nome.toLocaleLowerCase("pt-BR").includes(termo) || produto.descricao.toLocaleLowerCase("pt-BR").includes(termo))
  );
  const ordenar = document.querySelector("#ordenar-produtos")?.value || "relevancia";
  if (ordenar === "preco-menor") encontrados.sort((a,b) => a.preco-b.preco);
  if (ordenar === "preco-maior") encontrados.sort((a,b) => b.preco-a.preco);
  if (ordenar === "nome") encontrados.sort((a,b) => a.nome.localeCompare(b.nome,"pt-BR"));
  contador.textContent = encontrados.length === 1 ? "1 produto encontrado" : encontrados.length + " produtos encontrados";
  const resumoResultados = document.querySelector("#resumo-resultados");
  if (resumoResultados) resumoResultados.textContent = "Mostrando " + encontrados.length + (encontrados.length === 1 ? " produto" : " produtos");
  lista.replaceChildren();
  if (!encontrados.length) {
    const vazio = document.createElement("p");
    vazio.className = "sem-resultados";
    vazio.textContent = "Nenhum produto encontrado. Tente outro nome ou categoria.";
    lista.append(vazio);
    return;
  }
  encontrados.forEach(produto => {
    const artigo = document.createElement("article");
    artigo.className = "produto";
    const visual = document.createElement("div");
    visual.className = "produto-visual " + produto.classe;
    visual.setAttribute("aria-hidden","true");
    const etiqueta = document.createElement("span");
    etiqueta.className = "etiqueta-produto";
    etiqueta.textContent = produto.categoria;
    visual.append(etiqueta);
    const aparelho = document.createElement("div");
    aparelho.className = "mini-telefone " + (produto.acessorio ? "accessory" : produto.cor);
    const tela = document.createElement("div");
    tela.className = "mini-tela";
    aparelho.append(tela);
    visual.append(aparelho);
    const conteudo = document.createElement("div");
    conteudo.className = "produto-conteudo";
    const tipo = document.createElement("p");
    tipo.className = "produto-categoria"; tipo.textContent = produto.categoria;
    const titulo = document.createElement("h3"); titulo.textContent = produto.nome;
    const descricao = document.createElement("p");
    descricao.className = "produto-descricao"; descricao.textContent = produto.descricao;
    const rodape = document.createElement("div"); rodape.className = "produto-rodape";
    const preco = document.createElement("strong");
    preco.className = "produto-preco"; preco.textContent = dinheiro(produto.preco);
    const legenda = document.createElement("small"); legenda.textContent = "preço ilustrativo";
    preco.append(legenda);
    const adicionar = document.createElement("button");
    adicionar.type = "button"; adicionar.className = "adicionar-carrinho";
    adicionar.textContent = "＋ Adicionar";
    adicionar.setAttribute("aria-label","Adicionar " + produto.nome + " ao carrinho");
    adicionar.addEventListener("click",() => adicionarAoCarrinho(produto.id));
    rodape.append(preco,adicionar);
    conteudo.append(tipo,titulo,descricao,rodape);
    artigo.append(visual,conteudo);
    lista.append(artigo);
  });
}
document.querySelectorAll("[data-categoria]").forEach(botao => {
  botao.addEventListener("click",() => {
    document.querySelectorAll("[data-categoria]").forEach(item => {
      const ativo = item === botao;
      item.classList.toggle("ativo",ativo);
      item.setAttribute("aria-pressed",String(ativo));
    });
    desenharProdutos();
  });
});
const buscaEl = document.querySelector("#busca");
if (buscaEl) buscaEl.addEventListener("input",desenharProdutos);
const ordenarEl = document.querySelector("#ordenar-produtos");
if (ordenarEl) ordenarEl.addEventListener("change",desenharProdutos);
const limparFiltros = document.querySelector("#limpar-filtros");
if (limparFiltros) limparFiltros.addEventListener("click",() => {
  if (buscaEl) buscaEl.value = "";
  if (ordenarEl) ordenarEl.value = "relevancia";
  document.querySelectorAll("[data-categoria]").forEach(botao => {
    const ativo = botao.dataset.categoria === "Todos";
    botao.classList.toggle("ativo",ativo);
    botao.setAttribute("aria-pressed",String(ativo));
  });
  desenharProdutos();
});
const limpar = document.querySelector("#limpar-carrinho");
if (limpar) limpar.addEventListener("click",() => {
  salvarCarrinho([]);
  desenharCarrinho();
});
const finalizar = document.querySelector("#finalizar-pedido");
if (finalizar) finalizar.addEventListener("click",() => {
  const mensagem = document.querySelector("#mensagem-finalizacao");
  if (mensagem) mensagem.textContent = "Este é um carrinho demonstrativo. Para receber pedidos reais, configure um canal de atendimento ou sistema de pagamento.";
});
const ano = document.querySelector("#ano");
if (ano) ano.textContent = new Date().getFullYear();
desenharProdutos();
desenharCarrinho();
atualizarIndicadoresCarrinho();


// Mantém o carrinho e o contador sincronizados quando outra aba altera os itens.
window.addEventListener("storage", evento => {
  if (evento.key === CHAVE_CARRINHO || evento.key === null) {
    carrinhoTemporario = lerCarrinho();
    desenharCarrinho();
    atualizarIndicadoresCarrinho();
  }
});
