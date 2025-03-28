document.addEventListener("DOMContentLoaded", function () {
    fetchStock(); // Carrega os produtos ao iniciar a página
});

// Recupera o token armazenado no localStorage
function getToken() {
    return localStorage.getItem('authToken');
}

// Função para buscar a lista das notas de entrada e saída
function fetchStock() {
    const token = getToken();
    if (!token) {
        showModal("Token expirado!","Sessão expirada! Faça login novamente.");
        window.location.href = "index.html";
        return;
    }

    // Requisição para as entradas
    fetch("https://api-controle-de-estoque-production.up.railway.app/invoices/list", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Erro na requisição de entradas: ${response.status}`);
        }
        return response.json();
    })
    .then(entradas => {
        // Requisição para as saídas
        fetch("https://api-controle-de-estoque-production.up.railway.app/stock-output", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro na requisição de saídas: ${response.status}`);
            }
            return response.json();
        })
        .then(saidas => {
            // Combina entradas e saídas e atualiza a tabela
            const lancamentos = [...entradas, ...saidas]; // Junta as entradas e saídas
            atualizarTabelaPage(lancamentos);
        })
        .catch(error => {
            console.error("Erro ao buscar saídas:", error);
            showModal("Erro","Erro ao carregar saídas. Tente novamente.");
        });
    })
    .catch(error => {
        console.error("Erro ao buscar entradas:", error);
        showModal("Erro","Erro ao carregar entradas. Tente novamente.");
    });
}

// Atualiza a tabela com as notas de entrada e saída
let lancamentos = []; // Array que armazenará os lançamentos recebidos
let paginaAtual = 1;
const itensPorPagina = 20;

// Atualiza a tabela com paginação
function atualizarTabelaPage(novosLancamentos) {
    lancamentos = novosLancamentos; // Atualiza os dados
    paginaAtual = 1; // Reinicia a página para a primeira
    renderizarTabela();
}

// Renderiza os lançamentos paginados
function renderizarTabela() {
    const tabela = document.getElementById("tabela-lancamento");
    tabela.innerHTML = ""; // Limpa a tabela

    if (lancamentos.length === 0) {
        tabela.innerHTML = '<tr><td colspan="6">Nenhum produto encontrado.</td></tr>';
        return;
    }

    let inicio = (paginaAtual - 1) * itensPorPagina;
    let fim = inicio + itensPorPagina;
    let dadosPaginados = lancamentos.slice(inicio, fim);

    dadosPaginados.forEach(lancamento => {
        const data = new Date(lancamento.outputDate || lancamento.issueDate);
        const dataFormatada = isNaN(data.getTime()) ? "Data inválida" : new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).format(data);

        let tipoMovimento = lancamento.outputDate ? "Saída" : "Entrada";
        let numeroMovimento = lancamento.outputDate ? lancamento.id : lancamento.invoiceNumber;
        let nomeFornecedor = lancamento.outputDate ? "N/A" : lancamento.supplierName;
        let valorMovimento = lancamento.outputDate ? "N/A" : `R$ ${lancamento.totalAmount.toFixed(2)}`;

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${tipoMovimento}</td>
            <td>${numeroMovimento || "N/A"}</td>
            <td>${nomeFornecedor}</td>
            <td>${dataFormatada}</td>
            <td>${valorMovimento}</td>
        `;
        tabela.appendChild(row);
    });

    document.getElementById("pagina-atual").innerText = `Página ${paginaAtual}`;
}

// Função para avançar página
document.getElementById("btn-proximo").addEventListener("click", () => {
    let totalPaginas = Math.ceil(lancamentos.length / itensPorPagina);
    if (paginaAtual < totalPaginas) {
        paginaAtual++;
        renderizarTabela();
    }
});

// Função para voltar página
document.getElementById("btn-anterior").addEventListener("click", () => {
    if (paginaAtual > 1) {
        paginaAtual--;
        renderizarTabela();
    }
});


// Função para cadastrar um novo lançamento (entrada ou saída)
// Função para buscar pelo ID
// Função para buscar pelo ID (invoiceNumber)
function fetchVById() {
    const searchValue = document.getElementById('input-busca').value.trim();
    const token = localStorage.getItem('authToken');

    if (!token) {
        console.error("Token não encontrado. Faça login novamente.");
        showModal("Erro na validação do Token!", "Sessão expirada! Faça login novamente.");
        window.location.href = "index.html";
        return;
    }

    console.log("🔎 Buscando pelo valor:", searchValue);

    let urls = [
        'https://api-controle-de-estoque-production.up.railway.app/invoices/list',
        'https://api-controle-de-estoque-production.up.railway.app/stock-output'
    ];

    if (!searchValue) {
        // Busca todas as entradas e saídas quando o campo de pesquisa está vazio
        Promise.all(urls.map(url =>
            fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }).then(res => res.ok ? res.json() : [])
        ))
        .then(([entradas, saidas]) => {
            console.log("✅ Entradas e saídas recebidas:", entradas, saidas);
            const resultados = [...entradas, ...saidas];

            if (resultados.length > 0) {
                atualizarTabelaPage(resultados);
            } else {
                showModal("Erro", "Nenhum lançamento encontrado.");
            }
        })
        .catch(error => {
            console.error("⚠ Erro ao buscar lançamentos:", error);
            showModal("Erro", "Erro ao tentar buscar os dados. Tente novamente.");
        });

    } else {
        // Busca por invoiceNumber nas entradas e saídas
        fetch(urls[0], {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(res => res.ok ? res.json() : [])
        .then(invoices => {
            console.log("📥 Dados de invoices recebidos:", invoices);
            let entradasFiltradas = invoices.filter(e => e.invoiceNumber === searchValue);

            if (entradasFiltradas.length > 0) {
                atualizarTabelaPage(entradasFiltradas);
            } else {
                console.log("🔎 Nota não encontrada em invoices. Buscando por ID na saída...");

                // Se não encontrou nos invoices, busca diretamente na saída pelo ID
                return fetch(`https://api-controle-de-estoque-production.up.railway.app/stock-output/${searchValue}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })
                .then(res => res.ok ? res.json() : null)
                .then(saida => {
                    if (saida) {
                        console.log("✅ Nota de saída encontrada:", saida);
                        atualizarTabelaPage([saida]);
                    } else {
                        showModal("Erro", "Nenhuma entrada ou saída encontrada para o valor informado.");
                    }
                });
            }
        })
        .catch(error => {
            console.error("⚠ Erro ao buscar lançamentos:", error);
            showModal("Erro", "Erro ao tentar buscar os dados. Tente novamente.");
        });
    }
}






async function carregarFornecedor() {
    const token = localStorage.getItem('authToken');

    try {
        const response = await fetch("https://api-controle-de-estoque-production.up.railway.app/supplier/list", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`, // Adiciona o token no cabeçalho
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`Erro na API: ${response.status}`);
        }

        const categorias = await response.json();
        console.log("Categorias recebidas:", categorias); // Debug no console

        const select = document.getElementById("selectSupplier");
        select.innerHTML = '<option value="">Selecione um fornecedor</option>'; // Reseta o select

        if (!Array.isArray(categorias)) {
            throw new Error("Os dados da API não são um array.");
        }

        categorias.forEach(categoria => {
            if (!categoria.id || !categoria.name) {
                console.warn("Categoria inválida:", categoria);
                return;
            }

            const option = document.createElement("option");
            option.value = categoria.id; // ID que será enviado ao backend
            option.textContent = categoria.name; // Nome visível no select
            select.appendChild(option);
        });

    } catch (error) {
        console.error("Erro ao carregar categorias:", error);
    }
}

async function carregarProdutos() {
    const token = localStorage.getItem('authToken');

    try {
        const response = await fetch("https://api-controle-de-estoque-production.up.railway.app/products/list", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`, // Adiciona o token no cabeçalho
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`Erro na API: ${response.status}`);
        }

        const categorias = await response.json();
        console.log("Categorias recebidas:", categorias); // Debug no console

        const select = document.getElementById("productId");
        select.innerHTML = '<option value="">Selecione um produto</option>'; // Reseta o select

        if (!Array.isArray(categorias)) {
            throw new Error("Os dados da API não são um array.");
        }

        categorias.forEach(categoria => {
            if (!categoria.id || !categoria.name) {
                console.warn("Categoria inválida:", categoria);
                return;
            }

            const option = document.createElement("option");
            option.value = categoria.id; // ID que será enviado ao backend
            option.textContent = categoria.name; // Nome visível no select
            select.appendChild(option);
        });

    } catch (error) {
        console.error("Erro ao carregar categorias:", error);
    }
}

async function carregarProdutosSaida() {
    const token = localStorage.getItem('authToken');

    try {
        const response = await fetch("https://api-controle-de-estoque-production.up.railway.app/products/list", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`, // Adiciona o token no cabeçalho
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`Erro na API: ${response.status}`);
        }

        const categorias = await response.json();
        console.log("Categorias recebidas:", categorias); // Debug no console

        const select = document.getElementById("productIdSaida");
        select.innerHTML = '<option value="">Selecione um produto</option>'; // Reseta o select

        if (!Array.isArray(categorias)) {
            throw new Error("Os dados da API não são um array.");
        }

        categorias.forEach(categoria => {
            if (!categoria.id || !categoria.name) {
                console.warn("Categoria inválida:", categoria);
                return;
            }

            const option = document.createElement("option");
            option.value = categoria.id; // ID que será enviado ao backend
            option.textContent = categoria.name; // Nome visível no select
            select.appendChild(option);
        });

    } catch (error) {
        console.error("Erro ao carregar categorias:", error);
    }
}

let itensNotaFiscal = [];

function addProdutoNota() {
    const productSelect = document.getElementById("productId");
    const priceInput = document.getElementById("price");
    const quantityInput = document.getElementById("inputQuatityMoviment");

    const productId = productSelect.value;
    const productName = productSelect.options[productSelect.selectedIndex].text;
    const price = parseFloat(priceInput.value);
    const quantity = parseInt(quantityInput.value);

    if (!productId || isNaN(price) || isNaN(quantity) || quantity <= 0) {
        showModal("Preencha corretamente","Preencha todos os campos corretamente!");
        return;
    }

    const item = {
        productId: parseInt(productId),
        nome: productName, // Adiciona o nome do produto
        quantity: quantity,
        price: price
    };

    itensNotaFiscal.push(item); // Adiciona o item na lista global

    atualizarTabela(); // Atualiza a tabela de itens no modal

    console.log("Itens adicionados:", itensNotaFiscal); // Verifica os itens no console
}


let tipoMovimento = '';  // Variável global para armazenar o tipo de movimento, pode ser 'entrada' ou 'saida'

document.addEventListener('change', function (event) {
    if (event.target && event.target.id === 'tipoMovimentacao') {
        tipoMovimento = event.target.value;
        atualizarTabela();
    }
});

function atualizarTabela() {
    const tableBody = document.getElementById("productList");
    tableBody.innerHTML = ""; // Limpa a tabela antes de atualizar

    // Verifica se há itens na lista e atualiza a tabela
    itensNotaFiscal.forEach((item, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${item.nome}</td>
            <td>R$ ${item.price.toFixed(2)}</td>
            <td>${item.quantity}</td>
            <td>${tipoMovimento === 'entrada' ? 'Entrada' : 'Saída'}</td> <!-- Coluna de tipo de movimento -->
            <td><button type="button" class="btn btn-danger btn-sm" onclick="removerProduto(${index})">X</button></td>
        `;
        tableBody.appendChild(row);
    });
}

    function removerProduto(index) {
        itensNotaFiscal.splice(index, 1);
        atualizarTabela();
    }

    async function criarNotaFiscal() {
        const token = getToken(); // Recupera o token do localStorage

        if (!token) {
            console.error("Erro: Token de autenticação não encontrado.");
            return;
        }

        if (itensNotaFiscal.length === 0) {
            showModal("Preencha corretamente","Adicione pelo menos um item antes de criar a nota fiscal!");
            return;
        }

        const invoiceNumber = document.getElementById("NumeroNota").value;
        const supplierId = document.getElementById("selectSupplier").value;

        if (!invoiceNumber || !supplierId) {
            showModal("Preencha corretamente","Preencha o número da nota e selecione um fornecedor!");
            return;
        }

        try {
            let invoiceItemIds = [];
            console.log(itensNotaFiscal)

            // Criar os itens da nota fiscal e obter os IDs retornados
            for (const item of itensNotaFiscal) {
                const response = await fetch("https://api-controle-de-estoque-production.up.railway.app/invoice-items", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`, // Enviando token corretamente
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        productId: item.productId,
                        quantity: item.quantity,
                        unitPrice: item.price
                    }),
                });

                if (!response.ok) {
                    throw new Error(`Erro ao criar item: ${item.nome}`);
                }

                const data = await response.json();
                invoiceItemIds.push(data.id); // Captura o ID retornado do backend
            }

            // Criar a nota fiscal com os IDs dos itens
            const invoiceData = {
                invoiceNumber: invoiceNumber,
                supplierId: parseInt(supplierId),
                invoiceItemIds: invoiceItemIds
            };

            const invoiceResponse = await fetch("https://api-controle-de-estoque-production.up.railway.app/invoices", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`, // Enviando token corretamente
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(invoiceData),
            });

            if (!invoiceResponse.ok) {
                throw new Error("Erro ao criar a nota fiscal.");
            }

            showModal("Sucesso!!","Nota Fiscal criada com sucesso!");

            // Limpar tudo após o envio
            itensNotaFiscal = [];
            document.getElementById("NumeroNota").value = "";
            document.getElementById("selectSupplier").value = "";
            atualizarTabela();
        } catch (error) {
            console.error(error);
            showModal("Erro","Erro ao criar a nota fiscal.");
        }
}

document.getElementById("btnAdicionar-Produto").addEventListener("click", carregarProdutos);
document.getElementById("btnAdicionar-Produto").addEventListener("click", carregarFornecedor);

// Usar Object.defineProperty para observar alterações no array
Object.defineProperty(window, 'itensNotaFiscal', {
    get: function() {
      return itensNotaFiscal;
    },
    set: function(value) {
      itensNotaFiscal = value;
      console.log('itensNotaFiscal alterado:', itensNotaFiscal); // Exibe no console sempre que o array for alterado
    }
  });

  // Alterna os campos de acordo com o tipo de movimentação (Entrada ou Saída)
function toggleTipoMovimentacao() {
    const tipo = document.getElementById("tipoMovimentacao").value;
    const camposEntrada = document.getElementById("camposEntrada");

    if (tipo === "entrada") {
        camposEntrada.style.display = "block"; // Mostra os campos
    } else {
        camposEntrada.style.display = "none"; // Esconde os campos
    }
}

function atualizarModal() {
    const tipoMovimentacao = document.getElementById("tipoMovimentacao").value;
    const numeroNota = document.getElementById("NumeroNota").closest(".mb-3");
    const fornecedor = document.getElementById("selectSupplier").closest(".mb-3");
    const botaoEnviar = document.getElementById("btnEntrada");

    if (tipoMovimentacao === "entrada") {
        numeroNota.style.display = "block"; // Exibe campo de nota
        fornecedor.style.display = "block"; // Exibe campo de fornecedor
        botaoEnviar.textContent = "Registrar Entrada";
        botaoEnviar.setAttribute("onclick", "criarNotaFiscal()");
    } else {
        numeroNota.style.display = "none"; // Oculta campo de nota
        fornecedor.style.display = "none"; // Oculta campo de fornecedor
        botaoEnviar.textContent = "Registrar Saída";
        botaoEnviar.setAttribute("onclick", "processarSaidaEstoque()");
    }
}

async function processarSaidaEstoque() {
    const token = getToken(); // Obtém o token de autenticação

    if (itensNotaFiscal.length === 0) {
        showModal("Preencha corretamente","Adicione pelo menos um produto para registrar a saída.");
        return;
    }

    let itensComEstoqueInsuficiente = []; // Lista para armazenar produtos com estoque insuficiente

    // 🔎 Primeira etapa: Verificar estoque de todos os produtos antes de qualquer requisição de saída
    for (let item of itensNotaFiscal) {
        const productId = item.productId;
        const productName = item.nome;
        const quantity = item.quantity;

        try {
            console.log(`🔎 Verificando estoque do produto: ${productName} (ID: ${productId})`);

            const estoqueResponse = await fetch(`https://api-controle-de-estoque-production.up.railway.app/products/${productId}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (!estoqueResponse.ok) {
                throw new Error(`Erro ao buscar estoque para o produto ${productName}: ${estoqueResponse.status}`);
            }

            const produto = await estoqueResponse.json();
            const estoqueDisponivel = produto.quantity_stock;

            console.log(`📊 Estoque disponível para ${productName}: ${estoqueDisponivel}, Solicitado: ${quantity}`);

            if (quantity > estoqueDisponivel) {
                console.warn(`⚠ Estoque insuficiente para ${productName}`);
                itensComEstoqueInsuficiente.push(`${productName} (Disponível: ${estoqueDisponivel}, Solicitado: ${quantity})`);
            }
        } catch (error) {
            console.error(`❌ Erro ao verificar estoque para ${productName}:`, error);
        }
    }

    // 🚨 Se houver itens com estoque insuficiente, exibir alerta e interromper o processo
    if (itensComEstoqueInsuficiente.length > 0) {
        showModal("Erro!!","Os seguintes produtos têm estoque insuficiente:\n\n" + itensComEstoqueInsuficiente.join("\n"));
        return; // Interrompe a função sem enviar requisições de saída
    }

    // ✅ Segunda etapa: Enviar requisições de saída apenas para produtos com estoque suficiente
    for (let item of itensNotaFiscal) {
        const payload = {
            productId: parseInt(item.productId),
            quantity: item.quantity,
            observation: `Saída de estoque do produto: ${item.nome}`
        };

        try {
            console.log("📤 Enviando saída de estoque:", payload);

            const response = await fetch("https://api-controle-de-estoque-production.up.railway.app/stock-output", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Erro na API ao registrar saída do produto ${item.nome}: ${response.status}`);
            }

            showModal("Sucesso",`✅ Saída registrada com sucesso para ${item.nome}`);
            setTimeout(() => location.reload(), 500); // espera 500ms antes de recarregar
        } catch (error) {
            console.error("❌ Erro ao processar saída de estoque:", error);
        }
    }


}
function showModal(title, message) {
    // Define os textos dinâmicos
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalBody').innerText = message;

    // Mostra a modal
    const modal = new bootstrap.Modal(document.getElementById('customModal'));
    modal.show();
}
