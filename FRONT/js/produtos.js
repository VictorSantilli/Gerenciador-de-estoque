const limite = 20; // Produtos por página
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

// Atualiza a tabela com os produtos
function atualizarTabela(produtos) {
    const tabelaCorpo = document.getElementById('tableListProducts-body');
    tabelaCorpo.innerHTML = '';

    if (produtos.length === 0) {
        tabelaCorpo.innerHTML = '<tr><td colspan="5">Nenhum produto encontrado.</td></tr>';
        return;
    }

    produtos.forEach(produto => {
        const linha = document.createElement('tr');
        linha.innerHTML = `
            <td>${produto.id}</td>
            <td>${produto.title}</td>
            <td>${produto.category}</td>
            <td>R$ ${produto.price.toFixed(2)}</td>
            <td><img src="">${produto.stock}</td>
        `;
        tabelaCorpo.appendChild(linha);
    });
}


// Chama a função para carregar os produtos automaticamente ao abrir a página
document.addEventListener('DOMContentLoaded', () => {
    buscarProdutos(0).then(produtos => {
        atualizarTabela(produtos);  // Atualiza a tabela com os produtos
        atualizarPagina(0);         // Exibe a página inicial
    });
});

document.getElementById('btn-busca').addEventListener('click', () => {
    const termoBusca = document.getElementById('input-busca').value.trim();
    buscarProdutos(0, termoBusca).then(produtos => {
        atualizarTabela(produtos);
        paginaAtual = 0;    
        atualizarPagina(0);
    });
});

document.getElementById('btn-anterior').addEventListener('click', () => {
    if (paginaAtual > 0) {
        const termoBusca = document.getElementById('input-busca').value.trim();
        buscarProdutos(paginaAtual - 1, termoBusca).then(produtos => {
            atualizarTabela(produtos);
            paginaAtual--;
            atualizarPagina(paginaAtual);
        });
    }
});

document.getElementById('btn-proximo').addEventListener('click', () => {
    const termoBusca = document.getElementById('input-busca').value.trim();
    buscarProdutos(paginaAtual + 1, termoBusca).then(produtos => {
        if (produtos.length > 0) {
            atualizarTabela(produtos);
            paginaAtual++;
            atualizarPagina(paginaAtual);
        }
    });
});

// Atualiza a exibição da página
function atualizarPagina(pagina) {
    document.getElementById('pagina-atual').innerText = `Página ${pagina + 1}`;
}
