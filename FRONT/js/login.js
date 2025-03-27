// Função para fazer login e redirecionar para a página home
function loginUser(event) {
    event.preventDefault(); // Evita o envio do formulário e recarregamento da página
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const data = {
        email: email,
        password: password
    };

    fetch('https://api-controle-de-estoque-production.up.railway.app/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.token) {
            localStorage.setItem('authToken', data.token); 
            localStorage.setItem('userName', data.name); // Armazenando token
            window.location.href = 'home.html';  // Redireciona para a página de home
        } else {
            alert('Erro no login. Verifique suas credenciais.');
        }
    })
    .catch(error => {
        console.error('Erro ao tentar login', error);
        alert('Erro ao tentar login');
    });
}

// Função para fazer o cadastro
function registerUser(event) {
    event.preventDefault(); // Evita o envio do formulário e recarregamento da página
    const name = document.getElementById('name-register').value;
    const email = document.getElementById('email-register').value;
    const password = document.getElementById('password-register').value;

    const data = {
        name: name,
        email: email,
        password: password
    };

    fetch('https://api-controle-de-estoque-production.up.railway.app/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro na requisição: ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        if (data.name) {
            // Exibe a modal de sucesso
            const successModal = new bootstrap.Modal(document.getElementById('successModal'));
            successModal.show();
    
            // Redireciona após 2 segundos (ajustável)
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        } else {
            alert('Erro ao registrar usuário');
        }
    })
    .catch(error => {
        console.error('Erro ao registrar usuário 2', error);
        alert('Erro ao tentar registrar 3');
    });
}