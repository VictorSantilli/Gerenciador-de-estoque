document.addEventListener("DOMContentLoaded", function () {
    fetchCategories(); // Chama a função automaticamente ao carregar a página
});

function fetchCategories() {
    const token = localStorage.getItem('authToken'); // Recupera o token

    if (!token) {
        console.error("Token não encontrado. Faça login novamente.");
        showModal("Erro na validação do Token!","Sessão expirada! Faça login novamente.");
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
        showModal("Erro" , "Erro ao carregar categorias. Tente novamente.");
    });
}

let categorias = []; // Array para armazenar as categorias
let paginaAtual = 1;
const itensPorPagina = 10;

// Atualiza a tabela e reseta para a primeira página
function atualizarTabela(novasCategorias) {
    categorias = novasCategorias;
    paginaAtual = 1;
    renderizarTabela();
}

// Renderiza a tabela com paginação
function renderizarTabela() {
    const tabela = document.getElementById("tabela-categorias");
    tabela.innerHTML = "";

    if (categorias.length === 0) {
        tabela.innerHTML = '<tr><td colspan="3">Nenhuma categoria encontrada.</td></tr>';
        return;
    }

    let inicio = (paginaAtual - 1) * itensPorPagina;
    let fim = inicio + itensPorPagina;
    let dadosPaginados = categorias.slice(inicio, fim);

    dadosPaginados.forEach(categoria => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${categoria.id}</td>
            <td>${categoria.name}</td>
            <td>${categoria.description}</td>
        `;
        tabela.appendChild(row);
    });

    document.getElementById("pagina-categorias").innerText = `Página ${paginaAtual}`;
}

// Função para avançar página
document.getElementById("btn-proximo-categorias").addEventListener("click", () => {
    let totalPaginas = Math.ceil(categorias.length / itensPorPagina);
    if (paginaAtual < totalPaginas) {
        paginaAtual++;
        renderizarTabela();
    }
});

// Função para voltar página
document.getElementById("btn-anterior-categorias").addEventListener("click", () => {
    if (paginaAtual > 1) {
        paginaAtual--;
        renderizarTabela();
    }
});




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
        showModal("Erro na validação do Token!","Sessão expirada! Faça login novamente.");
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
        showModal("Sucesso!!","Categoria criada com sucesso!");
        // Opcionalmente, redireciona ou limpa o formulário
        setTimeout(() => {
            window.location.reload();
        }, 3000); // Recarrega a página ou pode atualizar a tabela
    })
    .catch(error => {
        console.error("Erro ao criar categoria:", error);
        showModal("Erro!","Erro ao tentar criar categoria. Tente novamente.");
    });
}

// Função para buscar categoria pelo ID

function fetchProduct() {
    const searchQuery = document.getElementById('input-busca').value.trim();
    const token = localStorage.getItem('authToken');

    if (!token) {
        console.error("Token não encontrado. Faça login novamente.");
        showModal("Erro na validação do Token!", "Sessão expirada! Faça login novamente.");
        window.location.href = "index.html";
        return;
    }

    let url;
    if (!searchQuery) {
        url = `https://api-controle-de-estoque-production.up.railway.app/categories/list`;
    } else if (!isNaN(searchQuery)) {
        url = `https://api-controle-de-estoque-production.up.railway.app/categories/${searchQuery}`;
    } else {
        url = `https://api-controle-de-estoque-production.up.railway.app/categories/searchName?name=${encodeURIComponent(searchQuery)}`;
    }

    console.log("🔎 Buscando URL:", url);

    fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        console.log("📥 Resposta recebida:", response);
        if (!response.ok) {
            throw new Error(`Erro ao buscar as categorias: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log("✅ Dados recebidos:", data);
        if (data) {
            atualizarTabela(Array.isArray(data) ? data : [data]); 
        } else {
            showModal("Erro!", "Nenhuma categoria encontrada!");
        }
    })
    .catch(error => {
        console.error("⚠ Erro ao buscar categorias:", error);
        showModal("Erro", "Erro ao tentar buscar as categorias. Tente novamente.");
    });
}


function showModal(title, message) {
    // Define os textos dinâmicos
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalBody').innerText = message;

    // Mostra a modal
    const modal = new bootstrap.Modal(document.getElementById('customModal'));
    modal.show();
}


