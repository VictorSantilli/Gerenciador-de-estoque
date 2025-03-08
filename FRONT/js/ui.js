// Atualiza a tabela com os produtos
function atualizarTabela(produtos) {
    const tabelaCorpo = document.getElementById('tabela-corpo');
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
            <td>R$ ${produto.price.toFixed(2)}</td>
            <td>${produto.category}</td>
            <td><img src="${produto.thumbnail}" width="50"></td>
        `;
        tabelaCorpo.appendChild(linha);
    });
}

// Atualiza a exibição da página
function atualizarPagina(pagina) {
    document.getElementById('pagina-atual').innerText = `Página ${pagina + 1}`;
}
