document.addEventListener("DOMContentLoaded", function () {
    fetchSuppliers(); // Chama a função automaticamente ao carregar a página
});

// Função para listar os fornecedores
function fetchSuppliers() {
    const token = localStorage.getItem('authToken'); // Recupera o token

    if (!token) {
        console.error("Token não encontrado. Faça login novamente.");
        showModal("Token expirado","Sessão expirada! Faça login novamente.");
        window.location.href = "index.html";
        return;
    }

    fetch("https://api-controle-de-estoque-production.up.railway.app/supplier/list", {
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
        atualizarFornecedores(data); // Chama a função para atualizar a tabela com fornecedores
    })
    .catch(error => {
        console.error("Erro ao buscar fornecedores:", error);
        showModal("erro","Erro ao carregar fornecedores. Tente novamente.");
    });
}

// Variáveis para paginação
let fornecedores = [];
let paginaAtualFornecedores = 1;
const itensPorPaginaFornecedores = 10;

// Função para renderizar a tabela com paginação
function renderizarTabelaFornecedores() {
    const tabela = document.getElementById("tabela-fornecedores");
    const spanPagina = document.getElementById("pagina-fornecedores");

    if (!tabela || !spanPagina) {
        console.error("Erro: Elementos de paginação não encontrados no DOM.");
        return;
    }

    tabela.innerHTML = ""; // Limpa a tabela

    if (fornecedores.length === 0) {
        tabela.innerHTML = '<tr><td colspan="5">Nenhum fornecedor encontrado.</td></tr>';
        return;
    }

    let inicio = (paginaAtualFornecedores - 1) * itensPorPaginaFornecedores;
    let fim = inicio + itensPorPaginaFornecedores;
    let dadosPaginados = fornecedores.slice(inicio, fim);

    dadosPaginados.forEach(fornecedor => {
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

    spanPagina.innerText = `Página ${paginaAtualFornecedores}`;
}

// Função para atualizar a lista de fornecedores e reiniciar a paginação
function atualizarFornecedores(novosFornecedores) {
    fornecedores = novosFornecedores;
    paginaAtualFornecedores = 1;  // Reseta para a primeira página
    renderizarTabelaFornecedores();
}

// Função para navegação
document.getElementById("btn-proximo-fornecedores")?.addEventListener("click", () => {
    let totalPaginas = Math.ceil(fornecedores.length / itensPorPaginaFornecedores);
    if (paginaAtualFornecedores < totalPaginas) {
        paginaAtualFornecedores++;
        renderizarTabelaFornecedores();
    }
});

document.getElementById("btn-anterior-fornecedores")?.addEventListener("click", () => {
    if (paginaAtualFornecedores > 1) {
        paginaAtualFornecedores--;
        renderizarTabelaFornecedores();
    }
});


// Função para buscar um fornecedor por ID
function fetchSuppplier() {
    const searchQuery = document.getElementById('input-busca').value.trim(); // Obtém o valor inserido

    // Recupera o token de autenticação do localStorage
    const token = localStorage.getItem('authToken');
    if (!token) {
        console.error("Token não encontrado. Faça login novamente.");
        showModal("Toke expirado!!","Sessão expirada! Faça login novamente.");
        window.location.href = "index.html"; // Redireciona para login se o token não existir
        return;
    }

    let url;
    // Se o campo estiver vazio, busca todos os produtos
    if (!searchQuery) {
        url = `https://api-controle-de-estoque-production.up.railway.app/supplier/list`;
    } 
    // Se for um número, busca por ID
    else if (!isNaN(searchQuery)) {
        url = `https://api-controle-de-estoque-production.up.railway.app/supplier/${searchQuery}`;
    } 
    // Caso contrário, busca por nome
    else {
        url = `https://api-controle-de-estoque-production.up.railway.app/supplier/searchName?name=${encodeURIComponent(searchQuery)}`;
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
            atualizarFornecedores(Array.isArray(data) ? data : [data]); // Garante que a função recebe um array
        } else {
            showModal("Erro","Nenhum supplier encontrado!");
        }
    })
    .catch(error => {
        console.error("Erro ao buscar supplier:", error);
        showModal("Erro","Erro ao tentar buscar os supplier. Tente novamente.");
    });
}

//Criar fornecedor
// Função para cadastrar o endereço
async function cadastrarEndereco() {
    const token = localStorage.getItem('authToken'); // Obtém o token de validação
    const enderecoData = {
        cep: document.getElementById("supplier-cep").value,
        public_place: document.getElementById("supplier-public-place").value,
        number: document.getElementById("supplier-number").value,
        neighborhood: document.getElementById("supplier-neighborhood").value,
        city: document.getElementById("supplier-city").value,
        state: document.getElementById("supplier-state").value,
    };

    try {
        const response = await fetch("https://api-controle-de-estoque-production.up.railway.app/adress", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`, // Inclui o token no cabeçalho
            },
            body: JSON.stringify(enderecoData),
        });

        if (!response.ok) throw new Error("Erro ao cadastrar o endereço");

        const result = await response.json();
        enderecoId = result.id; // Armazena o ID do endereço retornado pela API

        showModal("Sucesso","Endereço cadastrado com sucesso!");
        document.getElementById("saveSupplierButton").disabled = false; // Habilita o botão de fornecedor
    } catch (error) {
        showModal("erro!",error.message);
    }
}

// Função para cadastrar o fornecedor
async function cadastrarFornecedor() {
    if (!enderecoId) {
        showModal("Atenção","Cadastre o endereço antes de criar o fornecedor.");
        return;
    }

    const token = localStorage.getItem('authToken'); // Obtém o token de validação
    const fornecedorData = {
        name: document.getElementById("supplier-name").value,
        phone: document.getElementById("supplier-phone").value,
        email: document.getElementById("supplier-email").value,
        cnpj: document.getElementById("supplier-cnpj").value,
        adressId: enderecoId, // Vincula o ID do endereço cadastrado
    };

    try {
        const response = await fetch("https://api-controle-de-estoque-production.up.railway.app/supplier", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`, // Inclui o token no cabeçalho
            },
            body: JSON.stringify(fornecedorData),
        });

        if (!response.ok) throw new Error("Erro ao cadastrar o fornecedor");

        showModal("Sucesso!!","Fornecedor cadastrado com sucesso!");
        location.reload(); // Recarrega a página após o cadastro
    } catch (error) {
        showModal("erro",error.message);
    }
}

// Função para configurar os eventos onclick
function configurarEventos() {
    document.getElementById("saveSupplierButton").disabled = true; // Inicialmente desativa o botão
}

// Chama a função para configurar os eventos assim que o DOM estiver pronto
document.addEventListener("DOMContentLoaded", function () {
    configurarEventos();
});

function showModal(title, message) {
    // Define os textos dinâmicos
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalBody').innerText = message;

    // Mostra a modal
    const modal = new bootstrap.Modal(document.getElementById('customModal'));
    modal.show();
}
