const produtos = [
  {nome:"Smartphone Aurora Pro",categoria:"Premium",classe:"premium",cor:"purple",descricao:"Tela imersiva e recursos para fotos e vídeos.",preco:3899.90},
  {nome:"Smartphone Nova X",categoria:"Premium",classe:"premium",cor:"black",descricao:"Desempenho para multitarefas e entretenimento.",preco:3299.90},
  {nome:"Smartphone Essencial",categoria:"Intermediário",classe:"intermediario",cor:"green",descricao:"Uma opção versátil para a rotina.",preco:1499.90},
  {nome:"Smartphone Connect",categoria:"Intermediário",classe:"intermediario",cor:"blue",descricao:"Equilíbrio entre recursos e praticidade.",preco:1199.90},
  {nome:"Fone sem fio",categoria:"Acessório",classe:"acessorio",cor:"black",descricao:"Acessório demonstrativo para ouvir seus conteúdos.",preco:189.90,acessorio:true},
  {nome:"Smartphone Classic",categoria:"Intermediário",classe:"intermediario",cor:"gold",descricao:"Uma alternativa simples para tarefas do dia a dia.",preco:899.90}
];

const lista = document.querySelector("#lista-produtos");
const busca = document.querySelector("#busca");
const contador = document.querySelector("#contador-produtos");
const filtros = [...document.querySelectorAll("[data-categoria]")];
let categoriaAtiva = "Todos";

const dinheiro = valor => valor.toLocaleString("pt-BR", {style:"currency",currency:"BRL"});

function desenharProdutos() {
  const termo = busca.value.trim().toLocaleLowerCase("pt-BR");
  const encontrados = produtos.filter(produto =>
    (categoriaAtiva === "Todos" || produto.categoria === categoriaAtiva) &&
    (produto.nome.toLocaleLowerCase("pt-BR").includes(termo) ||
     produto.descricao.toLocaleLowerCase("pt-BR").includes(termo))
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
    visual.setAttribute("aria-hidden", "true");

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
    tipo.className = "produto-categoria";
    tipo.textContent = produto.categoria;
    const titulo = document.createElement("h3");
    titulo.textContent = produto.nome;
    const descricao = document.createElement("p");
    descricao.className = "produto-descricao";
    descricao.textContent = produto.descricao;
    const rodape = document.createElement("div");
    rodape.className = "produto-rodape";
    const preco = document.createElement("strong");
    preco.className = "produto-preco";
    preco.textContent = dinheiro(produto.preco);
    const legenda = document.createElement("small");
    legenda.textContent = "preço ilustrativo";
    preco.append(legenda);
    const detalhe = document.createElement("span");
    detalhe.className = "produto-detalhe";
    detalhe.setAttribute("aria-hidden", "true");
    detalhe.textContent = "↗";
    rodape.append(preco, detalhe);
    conteudo.append(tipo, titulo, descricao, rodape);
    artigo.append(visual, conteudo);
    lista.append(artigo);
  });
}

busca.addEventListener("input", desenharProdutos);
filtros.forEach(botao => {
  botao.addEventListener("click", () => {
    categoriaAtiva = botao.dataset.categoria;
    filtros.forEach(item => {
      const ativo = item === botao;
      item.classList.toggle("ativo", ativo);
      item.setAttribute("aria-pressed", String(ativo));
    });
    desenharProdutos();
  });
});
document.querySelector("#ano").textContent = new Date().getFullYear();
desenharProdutos();
