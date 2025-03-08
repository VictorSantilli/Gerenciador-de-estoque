const limite = 10; // Produtos por página
let paginaAtual = 0;

// Função para buscar produtos da API
function buscarProdutos(pagina = 0, termoBusca = '') {
    const skip = pagina * limite;
    let url = `https://dummyjson.com/products?limit=${limite}&skip=${skip}`;

    if (termoBusca !== '') {
        url = `https://dummyjson.com/products/search?q=${termoBusca}&limit=${limite}&skip=${skip}`;
    }

    return fetch(url)
        .then(res => res.json())
        .then(data => data.products)
        .catch(erro => {
            console.error('Erro ao buscar produtos:', erro);
            return [];
        });
}
