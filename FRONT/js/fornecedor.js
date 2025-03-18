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

    fetch("http://localhost:8080/supplier/list", {
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
function fetchProduct() {
    const searchQuery = document.getElementById('input-busca').value.trim(); // Obtém o valor inserido

    // Recupera o token de autenticação do localStorage
    const token = localStorage.getItem('authToken');
    if (!token) {
        console.error("Token não encontrado. Faça login novamente.");
        alert("Sessão expirada! Faça login novamente.");
        window.location.href = "TelaLogin.html"; // Redireciona para login se o token não existir
        return;
    }

    let url;
    // Se o campo estiver vazio, busca todos os produtos
    if (!searchQuery) {
        url = `http://localhost:8080/supplier/list`;
    } 
    // Se for um número, busca por ID
    else if (!isNaN(searchQuery)) {
        url = `http://localhost:8080/supplier/${searchQuery}`;
    } 
    // Caso contrário, busca por nome
    else {
        url = `http://localhost:8080/supplier/searchName?name=${encodeURIComponent(searchQuery)}`;
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
            throw new Error(`Erro ao buscar o supplier: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Exibe os produtos encontrados
        if (data) {
            atualizarTabela(Array.isArray(data) ? data : [data]); // Garante que a função recebe um array
        } else {
            alert("Nenhum supplier encontrado!");
        }
    })
    .catch(error => {
        console.error("Erro ao buscar supplier:", error);
        alert("Erro ao tentar buscar os supplier. Tente novamente.");
    });
}

// Função para criar um fornecedor com o endereço
async function createSupplier(event) {
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
        cnpj: cnpj
    };

    const addressData = {
        cep: cep,
        public_place: publicPlace,
        number: number,
        neighborhood: neighborhood,
        city: city,
        state: state,
    };

    // Recupera o token de autenticação do localStorage
    const token = localStorage.getItem('authToken');

    if (!token) {
        console.error("Token não encontrado. Faça login novamente.");
        alert("Sessão expirada! Faça login novamente.");
        window.location.href = "TelaLogin.html"; // Redireciona para login se o token não existir
        return;
    }

    try {
        // Primeiro, cria o endereço
        const addressId = await createAddress(addressData, token);

        // Agora, cria o fornecedor com o ID do endereço
        await createSupplierWithAddress(supplierData, addressId, token);

        alert("Fornecedor criado com sucesso!");
        window.location.reload(); // Recarrega a página ou pode atualizar a tabela

    } catch (error) {
        console.error("Erro ao criar fornecedor:", error);
        alert("Erro ao tentar criar fornecedor. Tente novamente.");
    }
}

// Função para criar o endereço
async function createAddress(addressData, token) {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('http://localhost:8080/address', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(addressData)
        });

        if (!response.ok) {
            throw new Error(`Erro na criação do endereço: ${response.status}`);
        }

        const data = await response.json();
        return data.id; // Retorna o ID do endereço criado

    } catch (error) {
        console.error("Erro ao criar endereço:", error);
        throw error; // Propaga o erro para a função que chamou
    }
}

// Função para criar o fornecedor com o ID do endereço
async function createSupplierWithAddress(supplierData, addressId, token) {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('http://localhost:8080/supplier', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...supplierData, // Dados do fornecedor
                addressId: addressId // Inclui o ID do endereço
            })
        });

        if (!response.ok) {
            throw new Error(`Erro ao criar fornecedor: ${response.status}`);
        }

        const data = await response.json();
        return data; // Retorna os dados do fornecedor criado

    } catch (error) {
        console.error("Erro ao criar fornecedor com endereço:", error);
        throw error; // Propaga o erro
    }
}
