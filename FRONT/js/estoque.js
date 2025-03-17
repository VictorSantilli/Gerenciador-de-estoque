document.addEventListener("DOMContentLoaded", function () {
    fetchStock(); // Carrega os produtos ao iniciar a página
});

// Recupera o token armazenado no localStorage
function getToken() {
    return localStorage.getItem('authToken');
}

// Função para buscar a lista de produtos
function fetchStock() {
    const token = getToken();
    if (!token) {
        alert("Sessão expirada! Faça login novamente.");
        window.location.href = "TelaLogin.html";
        return;
    }

    fetch("http://localhost:8081/stockMovement/list", {
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
function atualizarTabela(lancamentos) {
    const tabela = document.getElementById("tabela-lancamento");
    tabela.innerHTML = ""; // Limpa a tabela antes de atualizar

    if (lancamentos.length === 0) {
        tabela.innerHTML = '<tr><td colspan="6">Nenhum produto encontrado.</td></tr>';
        return;
    }

    lancamentos.forEach(lancamentos => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${lancamentos.id}</td>
            <td>${lancamentos.movementType}</td>
            <td>${lancamentos.productName}</td>
            <td>${lancamentos.quantity}</td>
            <td>${lancamentos.movementDate}</td>
            <td>${lancamentos.observation}</td>
            <td>${lancamentos.supplierName}</td>
           
        `;
        tabela.appendChild(row);
    });
}

// Função para cadastrar um novo lançamento (entrada ou saída)
function createStockMovement(event, type) {
    event.preventDefault(); // Evita que o formulário seja enviado normalmente

    // Captura os valores do formulário
    const productId = parseInt(document.getElementById('productId').value, 10);
    const supplierId = parseInt(document.getElementById('selectSupplier').value, 10);
    const quantity = parseInt(document.getElementById('inputQuatityMoviment').value, 10);
    const price = parseFloat(document.getElementById('price').value);
    const observation = document.getElementById('description').value;

    // Verifica se o tipo de movimento foi passado corretamente
    if (!["entrada", "saida"].includes(type)) {
        alert("Tipo de movimentação inválido.");
        return;
    }

    // Monta o objeto JSON do movimento de estoque
    const stockMovementData = {
        productId: productId,
        movementType: type, // "entrada" ou "saida"
        quantity: quantity,
        observation: observation,
        supplierId: supplierId,
        price: price
    };

    const token = getToken();
    if (!token) {
        alert("Sessão expirada! Faça login novamente.");
        window.location.href = "TelaLogin.html";
        return;
    }

    fetch("http://localhost:8081/stockMovement", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(stockMovementData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status}`);
        }
        return response.json();
    })
    .then(() => {
        alert("Movimentação registrada com sucesso!");
         // Limpa o formulário
        fetchStockMovements(); // Atualiza a lista de movimentações
    })
    .catch(error => {
        console.error("Erro ao registrar movimentação:", error);
        alert("Erro ao tentar registrar a movimentação. Tente novamente.");
    });
}

// Função para buscar categoria pelo ID
function fetchVById() {
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