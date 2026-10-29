const produtos = [
  {id:"aurora-pro",nome:"Smartphone Aurora Pro",categoria:"Premium",classe:"premium",cor:"purple",descricao:"Tela imersiva e recursos para fotos e vídeos.",preco:3899.90},
  {id:"nova-x",nome:"Smartphone Nova X",categoria:"Premium",classe:"premium",cor:"black",descricao:"Desempenho para multitarefas e entretenimento.",preco:3299.90},
  {id:"essencial",nome:"Smartphone Essencial",categoria:"Intermediário",classe:"intermediario",cor:"green",descricao:"Uma opção versátil para a rotina.",preco:1499.90},
  {id:"connect",nome:"Smartphone Connect",categoria:"Intermediário",classe:"intermediario",cor:"blue",descricao:"Equilíbrio entre recursos e praticidade.",preco:1199.90},
  {id:"fone-sem-fio",nome:"Fone sem fio",categoria:"Acessório",classe:"acessorio",cor:"black",descricao:"Acessório demonstrativo para ouvir seus conteúdos.",preco:189.90,acessorio:true},
  {id:"classic",nome:"Smartphone Classic",categoria:"Intermediário",classe:"intermediario",cor:"gold",descricao:"Uma alternativa simples para tarefas do dia a dia.",preco:899.90}
];

const CHAVE_CARRINHO = "ss-celulares-carrinho-v1";
const dinheiro = valor => valor.toLocaleString("pt-BR", {style:"currency",currency:"BRL"});

function lerCarrinho() {
  try {
    const dados = JSON.parse(localStorage.getItem(CHAVE_CARRINHO) || "[]");
    return Array.isArray(dados) ? dados.filter(item => produtos.some(p => p.id === item.id) && Number.isInteger(item.quantidade) && item.quantidade > 0) : [];
  } catch {
    return [];
  }
}
function salvarCarrinho(carrinho) {
  try { localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(carrinho)); } catch {}
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
  if (existente) existente.quantidade += 1;
  else carrinho.push({id,quantidade:1});
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
  item.quantidade += delta;
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
  const encontrados = produtos.filter(produto =>
    (categoriaAtiva === "Todos" || produto.categoria === categoriaAtiva) &&
    (produto.nome.toLocaleLowerCase("pt-BR").includes(termo) || produto.descricao.toLocaleLowerCase("pt-BR").includes(termo))
  );
  contador.textContent = encontrados.length === 1 ? "1 opção encontrada" : encontrados.length + " opções encontradas";
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
