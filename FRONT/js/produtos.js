document.addEventListener("DOMContentLoaded", function () {
    fetchProducts(); // Carrega os produtos ao iniciar a página
});

// Recupera o token armazenado no localStorage
function getToken() {
    return localStorage.getItem('authToken');
}

// Função para buscar a lista de produtos
function fetchProducts() {
    const token = getToken();
    if (!token) {
        alert("Sessão expirada! Faça login novamente.");
        window.location.href = "TelaLogin.html";
        return;
    }

    fetch("http://localhost:8081/products/list", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
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
        atualizarTabela(data);
    })
    .catch(error => {
        console.error("Erro ao buscar produtos:", error);
        alert("Erro ao carregar produtos. Tente novamente.");
    });
}

// Atualiza a tabela com os produtos
function atualizarTabela(produtos) {
    const tabela = document.getElementById("tableListProducts-body");
    tabela.innerHTML = ""; // Limpa a tabela antes de atualizar

    if (produtos.length === 0) {
        tabela.innerHTML = '<tr><td colspan="6">Nenhum produto encontrado.</td></tr>';
        return;
    }

    produtos.forEach(produto => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${produto.id}</td>
            <td>${produto.name}</td>
            <td>${produto.nameCategory}</td>
            <td>${produto.description}</td>
            <td>${produto.quantity_min}</td>
            <td>${produto.quantity_stock}</td>
            <td>${produto.unit_of_measure}</td>
           
        `;
        tabela.appendChild(row);
    });
}

// Função para cadastrar um novo produto
function createProduct(event) {
    event.preventDefault(); // Evita que o formulário seja enviado normalmente

    // Captura os valores do formulário
    const name = document.getElementById('productName').value;
    const description = document.getElementById('description').value;
    const quantity_min = parseInt(document.getElementById('quantityMin').value, 10);
    const unit_of_measure = document.getElementById('unityMeasure').value;
    const categoryId = parseInt(document.getElementById('productCategory').value, 10);

    // Monta o objeto JSON do produto
    const productData = {
        name: name,
        description: description,
        quantity_min: quantity_min,
        unit_of_measure: unit_of_measure,
        status: "ativo",
        categoryId: categoryId
    };

    const token = getToken();
    if (!token) {
        alert("Sessão expirada! Faça login novamente.");
        window.location.href = "TelaLogin.html";
        return;
    };

    fetch("http://localhost:8081/products", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(productData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status} `);
        }
        return response.json();
    })
    .then(() => {
        alert("Produto cadastrado com sucesso!");
        document.getElementById('addProductForm').reset(); // Limpa o formulário
        fetchProducts(); // Atualiza a lista de produtos
    })
    .catch(error => {
        console.error("Erro ao criar produto:", error);
        alert("Erro ao tentar cadastrar o produto. Tente novamente.");
    });
}

// Função para buscar categoria pelo ID
function fetchProductById() {
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
    fetch(`http://localhost:8081/products/${categoryId}`, {
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