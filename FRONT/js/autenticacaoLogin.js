// script.js
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Evita o envio do formulário padrão

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Exibir mensagem de erro vazia antes de fazer a requisição
    document.getElementById('error-message').textContent = '';

    // Validação simples do cliente (email e senha não podem estar vazios)
    if (!email || !password) {
        document.getElementById('error-message').textContent = 'Por favor, preencha todos os campos.';
        return;
    }

    // Requisição GET para a API com os parâmetros de email e senha
    const apiUrl = `https://api.exemplo.com/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;

    fetch(apiUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Se a resposta for positiva (usuário autenticado)
            window.location.href = 'dashboard.html'; // Redireciona para o painel do usuário
        } else {
            // Se o login falhar, exibe a mensagem de erro
            document.getElementById('error-message').textContent = 'Email ou senha incorretos.';
        }
    })
    .catch(error => {
        console.error('Erro de autenticação:', error);
        document.getElementById('error-message').textContent = 'Erro ao conectar com o servidor. Tente novamente.';
    });
});
