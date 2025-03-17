document.addEventListener("DOMContentLoaded", function () {
    fetchSuppliers(); // Chama a função automaticamente ao carregar a página
});

// Função para listar os fornecedores
function fetchSuppliers() {
    const token = localStorage.getItem('authToken'); // Recupera o token

    if (!token) {
        console.error("Token não encontrado. Faça login novamente.");
        alert("Sessão expirada! Faça login novamente.");
        window.location.href = "TelaLogin.html";
        return;
    }

    fetch("http://localhost:8081/supplier/list", {
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
        atualizarTabela(data); // Chama a função para atualizar a tabela com fornecedores
    })
    .catch(error => {
        console.error("Erro ao buscar fornecedores:", error);
        alert("Erro ao carregar fornecedores. Tente novamente.");
    });
}

// Função para atualizar a tabela com os fornecedores
function atualizarTabela(fornecedores) {
    const tabela = document.getElementById("tabela-fornecedores");
    tabela.innerHTML = ""; // Limpa a tabela antes de atualizar

    fornecedores.forEach(fornecedor => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${fornecedor.id}</td>
            <td>${fornecedor.name}</td>
            <td>${fornecedor.cnpj}</td>
            <td>${fornecedor.phone}</td>
            <td>${fornecedor.email}</td>
        `;
        tabela.appendChild(row);
    });
}

// Função para buscar um fornecedor por ID
function fetchSupplierById() {
    const supplierId = document.getElementById('input-busca').value; // Obtém o ID inserido
    if (!supplierId) {
        alert("Por favor, insira um ID.");
        return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
        console.error("Token não encontrado. Faça login novamente.");
        alert("Sessão expirada! Faça login novamente.");
        window.location.href = "TelaLogin.html";
        return;
    }

    fetch(`http://localhost:8081/supplier/${supplierId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Erro ao buscar fornecedor: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data) {
            atualizarTabela([data]); // Atualiza a tabela com o fornecedor encontrado
        } else {
            alert("Fornecedor não encontrado!");
        }
    })
    .catch(error => {
        console.error("Erro ao buscar fornecedor:", error);
        alert("Erro ao tentar buscar o fornecedor. Tente novamente.");
    });
}

// Função para criar um fornecedor
function createSupplier(event) {
    event.preventDefault(); // Evita que o formulário seja enviado de forma convencional

    // Pegando os dados do formulário
    const name = document.getElementById('supplier-name').value;
    const phone = document.getElementById('supplier-phone').value;
    const email = document.getElementById('supplier-email').value;
    const cnpj = document.getElementById('supplier-cnpj').value;
    const cep = document.getElementById('supplier-cep').value;
    const publicPlace = document.getElementById('supplier-public-place').value;
    const number = document.getElementById('supplier-number').value;
    const neighborhood = document.getElementById('supplier-neighborhood').value;
    const city = document.getElementById('supplier-city').value;
    const state = document.getElementById('supplier-state').value;

    // Preparando os dados para enviar
    const supplierData = {
        name: name,
        phone: phone,
        email: email,
        cnpj: cnpj,
        cep: cep,
        public_place: publicPlace,
        number: number,
        neighborhood: neighborhood,
        city: city,
        state: state
    };

    // Recupera o token de autenticação do localStorage
    const token = localStorage.getItem('authToken');

    if (!token) {
        console.error("Token não encontrado. Faça login novamente.");
        alert("Sessão expirada! Faça login novamente.");
        window.location.href = "TelaLogin.html"; // Redireciona para login se o token não existir
        return;
    }

    // Enviando a requisição POST para criar o fornecedor
    fetch('http://localhost:8081/supplier', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`, // Adiciona o token de autenticação
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(supplierData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        alert("Fornecedor criado com sucesso!");
        window.location.reload(); // Recarrega a página ou pode atualizar a tabela
    })
    .catch(error => {
        console.error("Erro ao criar fornecedor:", error);
        alert("Erro ao tentar criar fornecedor. Tente novamente.");
    });
}
