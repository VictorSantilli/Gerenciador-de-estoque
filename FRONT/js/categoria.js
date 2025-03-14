document.addEventListener("DOMContentLoaded", function () {
    fetchCategories(); // Chama a função automaticamente ao carregar a página
});

function fetchCategories() {
    const token = localStorage.getItem('authToken'); // Recupera o token

    if (!token) {
        console.error("Token não encontrado. Faça login novamente.");
        alert("Sessão expirada! Faça login novamente.");
        window.location.href = "TelaLogin.html";
        return;
    }

    fetch("http://localhost:8080/categories/list", {
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
    tabela.innerHTML = ""; // Limpa a tabela antes de atualizar

    categorias.forEach(categoria => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${categoria.id}</td>
            <td>${categoria.name}</td>
            <td>${categoria.description}</td>
        `;
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
        window.location.href = "TelaLogin.html"; // Redireciona para login se o token não existir
        return;
    }

    // Enviando a requisição POST para a API
    fetch('http://localhost:8080/categories', {
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
function fetchCategoryById() {
    const categoryId = document.getElementById('input-busca').value; // Obtém o ID inserido
    if (!categoryId) {
        alert("Por favor, insira um ID.");
        return;
    }

    // Recupera o token de autenticação do localStorage
    const token = localStorage.getItem('authToken');
    if (!token) {
        console.error("Token não encontrado. Faça login novamente.");
        alert("Sessão expirada! Faça login novamente.");
        window.location.href = "TelaLogin.html"; // Redireciona para login se o token não existir
        return;
    }

    // Fazendo a requisição GET para buscar a categoria pelo ID
    fetch(`http://localhost:8080/categories/${categoryId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`, // Adiciona o token de autenticação
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Erro ao buscar a categoria: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Exibe os dados da categoria se encontrados
        if (data) {
           //Atualiza a tabelo com os dados recebidos
           atualizarTabela([data])
        } else {
            alert("Categoria não encontrada!");
        }
    })
    .catch(error => {
        console.error("Erro ao buscar categoria:", error);
        alert("Erro ao tentar buscar a categoria. Tente novamente.");
    });
}