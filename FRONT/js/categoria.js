document.addEventListener("DOMContentLoaded", function () {
    fetchCategories(); // Chama a função automaticamente ao carregar a página
});

function fetchCategories() {
    const token = localStorage.getItem('authToken'); // Recupera o token

    if (!token) {
        console.error("Token não encontrado. Faça login novamente.");
        alert("Sessão expirada! Faça login novamente.");
        window.location.href = "index.html";
        return;
    }

    console.log(token)

    fetch("https://api-controle-de-estoque-production.up.railway.app/categories/list", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`, // Adiciona o token no cabeçalho
            "Content-Type": "application/json"
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        atualizarTabela(data); // Chama a função para atualizar a tabela
    })
    .catch(error => {
        console.error("Erro ao buscar categorias:", error);
        alert("Erro ao carregar categorias. Tente novamente.");
    });
}

function atualizarTabela(categorias) {
    const tabela = document.getElementById("tabela-categorias");
    tabela.innerHTML = "";

    categorias.forEach(categoria => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${categoria.id}</td>
            <td>${categoria.name}</td>
            <td>${categoria.description}</td>
            <td><button class="btn btn-sm btn-danger">Delete</button></td>
            <td><button class="btn btn-sm btn-secondary" data-bs-toggle="modal" data-bs-target="#modalEditarCategoria">Editar</button></td>
        `;

        // Botão de excluir
        const btnExcluir = row.querySelector("button.btn-danger");
        btnExcluir.addEventListener("click", () => {
            if (confirm(`Deseja excluir a categoria "${categoria.name}"?`)) {
                excluirCategoria(categoria.id);
            }
        });

        // Botão de editar
        const btnEditar = row.querySelector("button.btn-secondary");
        btnEditar.addEventListener("click", () => {
            editarCategoria(categoria); // Exibe a modal de edição com os dados da categoria
        });

        tabela.appendChild(row);
    });
}



// Cadastro
// Função para enviar o POST e criar a categoria
function createCategory(event) {
    event.preventDefault(); // Evita que o formulário seja enviado de forma convencional

    // Pegando os dados do formulário
    const name = document.getElementById('category-name').value;
    const description = document.getElementById('category-description').value;

    // Preparando os dados para enviar
    const categoryData = {
        name: name,
        description: description
    };

    // Recupera o token de autenticação do localStorage
    const token = localStorage.getItem('authToken');

    if (!token) {
        console.error("Token não encontrado. Faça login novamente.");
        alert("Sessão expirada! Faça login novamente.");
        window.location.href = "index.html"; // Redireciona para login se o token não existir
        return;
    }

    // Enviando a requisição POST para a API
    fetch('https://api-controle-de-estoque-production.up.railway.app/categories', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`, // Adiciona o token de autenticação
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(categoryData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Exibe mensagem de sucesso
        alert("Categoria criada com sucesso!");
        // Opcionalmente, redireciona ou limpa o formulário
        window.location.reload(); // Recarrega a página ou pode atualizar a tabela
    })
    .catch(error => {
        console.error("Erro ao criar categoria:", error);
        alert("Erro ao tentar criar categoria. Tente novamente.");
    });
}

// Função para buscar categoria pelo ID

function fetchProduct() {
    const searchQuery = document.getElementById('input-busca').value.trim(); // Obtém o valor inserido

    // Recupera o token de autenticação do localStorage
    const token = localStorage.getItem('authToken');
    if (!token) {
        console.error("Token não encontrado. Faça login novamente.");
        alert("Sessão expirada! Faça login novamente.");
        window.location.href = "index.html"; // Redireciona para login se o token não existir
        return;
    }

    let url;
    // Se o campo estiver vazio, busca todos os produtos
    if (!searchQuery) {
        url = `https://api-controle-de-estoque-production.up.railway.app/categories/list`;
    } 
    // Se for um número, busca por ID
    else if (!isNaN(searchQuery)) {
        url = `https://api-controle-de-estoque-production.up.railway.app/categories/${searchQuery}`;
    } 
    // Caso contrário, busca por nome
    else {
        url = `https://api-controle-de-estoque-production.up.railway.app/categories/searchName?name=${encodeURIComponent(searchQuery)}`;
    }

    // Fazendo a requisição GET para buscar os produtos
    fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Erro ao buscar o categories: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Exibe os produtos encontrados
        if (data) {
            atualizarTabela(Array.isArray(data) ? data : [data]); // Garante que a função recebe um array
        } else {
            alert("Nenhum categories encontrado!");
        }
    })
    .catch(error => {
        console.error("Erro ao buscar categories:", error);
        alert("Erro ao tentar buscar os categories. Tente novamente.");
    });
}

function excluirCategoria(idCategoria) {
    const token = localStorage.getItem('authToken');

    console.log(token)

    if (!token) {
        alert("Sessão expirada! Faça login novamente.");
        window.location.href = "index.html";
        return;
    }

    fetch(`https://api-controle-de-estoque-production.up.railway.app/categories/${idCategoria}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status}`);
        }
        alert("Categoria excluída com sucesso!");
        window.location.reload();
    })
    .catch(error => {
        console.error("Erro ao excluir categoria:", error);
        alert("Erro ao tentar excluir categoria.");
    });
}

function atualizarCategoria(idCategoria, novosDados) {
    const token = localStorage.getItem('authToken'); // Pega o token de autenticação

    if (!token) {
        alert("Sessão expirada! Faça login novamente.");
        window.location.href = "index.html";
        return;
    }

    fetch(`https://jsonplaceholder.typicode.com/posts/${idCategoria}`, {
        method: 'PUT', // Usando PUT para atualização
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json' // O conteúdo será no formato JSON
        },
        body: JSON.stringify(novosDados) // Envia os novos dados da categoria
    })
    .then(response => response.json())
    .then(data => {
        alert("Categoria atualizada com sucesso!");

        // Fecha a modal após salvar a atualização
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalEditarCategoria'));
        modal.hide();

        // Recarrega a tabela para mostrar as alterações
        window.location.reload();
    })
    .catch(error => {
        console.error("Erro ao atualizar categoria:", error);
        alert("Erro ao tentar atualizar categoria.");
    });
}


function editarCategoria(categoria) {
    // Preenche o formulário com os dados da categoria
    document.getElementById("inputIdCategoria").value = categoria.id;
    document.getElementById("inputNomeCategoria").value = categoria.name;
    document.getElementById("inputDescricaoCategoria").value = categoria.description;
    
    // Adiciona o evento para o botão de salvar a edição
    document.getElementById("salvarEdicaoBtn").onclick = () => {
        const idCategoria = document.getElementById("inputIdCategoria").value;
        const novoNome = document.getElementById("inputNomeCategoria").value;
        const novaDescricao = document.getElementById("inputDescricaoCategoria").value;

        const novosDados = {
            name: novoNome,
            description: novaDescricao
        };

        atualizarCategoria(idCategoria, novosDados);
    };
}

function atualizarCategoria(idCategoria, novosDados) {
    const token = localStorage.getItem('authToken'); // Pega o token de autenticação

    if (!token) {
        alert("Sessão expirada! Faça login novamente.");
        window.location.href = "index.html";
        return;
    }

    fetch(`https://api-controle-de-estoque-production.up.railway.app/categories/${idCategoria}`, {
        method: 'PUT', // Usando PUT para atualização
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json' // O conteúdo será no formato JSON
        },
        body: JSON.stringify(novosDados) // Envia os novos dados da categoria
    })
    .then(response => response.json())
    .then(data => {
        alert("Categoria atualizada com sucesso!");
        window.location.reload(); // Recarrega a página para mostrar a categoria atualizada
    })
    .catch(error => {
        console.error("Erro ao atualizar categoria:", error);
        alert("Erro ao tentar atualizar categoria.");
    });
}
