let carrinho =[];
async function carregarCardapio() { 
    try {
        const resposta = await fetch('https://cafeteriasite.onrender.com/api/produtos');
        const produtos = await resposta.json();
        
     
        const containers = document.querySelectorAll('.cardapio');
        
        containers.forEach(c => c.innerHTML = '');

        produtos.forEach((p, index) => {
            const cardHTML = `
                <div class="card cardhover border-secondary" style="width: 22rem;">
                    <img src="assets/${p.imagem}" class="card-img-left w-50 m-2" alt="imagem: ${p.nome}">
                    <div class="card-body">
                        <div class="linha d-flex justify-content-between align-items-center w-100">
                            <h5 class="card-title">${p.nome}</h5>
                            <h5 class="card-price text-end">R$ ${p.preco.toFixed(2).replace('.', ',')}</h5>
                        </div>
                        <p class="card-text">${p.descricao}</p>
                        <button class="btn btn-dark w-75 mt-1" onclick="adicionarAoCarrinho('${p._id}','${p.imagem}', '${p.nome}', ${p.preco})">
                        Adicionar ao Carrinho
                    </button>
                    </div>
                </div>
            `;

            if (index < 3) {
                containers[0].innerHTML += cardHTML;
            } else if (index < 6) {
             if (containers[1]) {
                containers[1].innerHTML += cardHTML;
                }
            }
            });
    } catch (erro) {
        console.error("Erro ao carregar o cardápio:", erro);
    }
}
carregarCardapio();



function adicionarAoCarrinho(id, imagem, nome, preco) {
    const item = { 
        nome: nome, 
        preco: parseFloat(preco),
        imagem: imagem 
    };

    console.log(item)
    carrinho.push(item);
    alert("Item adicionado: " + item.nome);
    console.log("Carrinho atual:", carrinho);

    atualizarInterfaceCarrinho();
}

function atualizarInterfaceCarrinho() {
    const listaHTML = document.getElementById('lista-carrinho');
    const totalHTML = document.getElementById('total-carrinho');
    const badgeFlutuante = document.getElementById('carrinho-qtd');
    const badgeFlutuanteMobile = document.getElementById('carrinho-qtd-mobile');

    listaHTML.innerHTML = '';
    
    let valorTotal = 0;
    carrinho.forEach((item, index) => {
        valorTotal += item.preco;

        listaHTML.innerHTML += `
            <li class="list-group-item bg-transparent text-white d-flex align-items-center gap-3 border-secondary">
                <img src="assets/${item.imagem}" alt="${item.nome}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 5px;">
                <div class="flex-grow-1">
                    <h6 class="mb-0 small">${item.nome}</h6>
                    <span class="text-secondary small">R$ ${item.preco}</span>
                </div>
                <button class="btn btn-sm text-danger" onclick="removerDoCarrinho(${index})">
                    <i class="bi bi-trash"></i>
                </button>
                <button class="btn btn-sm btn-outline-primary border-0" onclick="duplicarItem(${index})" title="Adicionar mais um">
                  <i class="bi bi-plus-circle"></i>
                </button>
            </li>
        `;
    });

    if (badgeFlutuante || badgeFlutuanteMobile) {
        badgeFlutuante.innerText = carrinho.length;
        badgeFlutuanteMobile.innerText = carrinho.length;
    }

    if (totalHTML) {
        totalHTML.innerText = `Total: R$ ${valorTotal.toFixed(2).replace('.', ',')}`;
    }
}


function removerDoCarrinho(index) {
    carrinho.splice(index, 1); 
    atualizarInterfaceCarrinho(); 
}

function duplicarItem(index) {
    const itemCopiado = { ...carrinho[index] };
    carrinho.splice(index + 1, 0, itemCopiado);
    
    atualizarInterfaceCarrinho();
}

function irParaEntrega() {
    if (carrinho.length === 0) {
        alert("Adicione itens antes de continuar!");
        return;
    }
    // Esconde a lista e mostra o formulário
    document.getElementById('tela-carrinho').classList.add('d-none');
    document.getElementById('tela-entrega').classList.remove('d-none');
}

function voltarParaCarrinho() {
    // Esconde o formulário e mostra a lista
    document.getElementById('tela-entrega').classList.add('d-none');
    document.getElementById('tela-carrinho').classList.remove('d-none');
}


async function enviarParaZap() {const agora = new Date();
    const horaAtual = agora.getHours();

    if (horaAtual >= 8 && horaAtual < 22) {
        const nome = document.getElementById('cliente-nome').value;
        const telefone = document.getElementById('cliente-telefone').value;
        const endereco = document.getElementById('cliente-endereco').value;
        const pagamento = document.getElementById('cliente-pagamento').value;
        const emailCliente = document.getElementById('cliente-email').value;

        if (!nome || !emailCliente || !telefone || !endereco) {
            alert("Preencha Nome, Email, telefone e Endereço!");
            return;
        }

        const pedido = {
            cliente: nome,
            emailCliente: emailCliente,
            endereco: endereco,
            pagamento: pagamento,
            itens: carrinho, 
            total: carrinho.reduce((acc, item) => acc + item.preco, 0).toFixed(2)
        };

        try {
            const resposta = await fetch('https://cafeteriasite.onrender.com/api/finalizar-pedido', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pedido)
            });

            if (resposta.ok) {
                alert("Pedido enviado com sucesso para seu e-mail!");
                carrinho = [];
                atualizarInterfaceCarrinho();
                voltarParaCarrinho();
                document.getElementById('form-entrega').reset();
            } else {
                alert("O servidor recebeu o pedido, mas houve um erro no envio do e-mail.");
            }
        } catch (erro) {
            console.error("Erro na requisição:", erro);
            alert("Não foi possível conectar ao servidor. Verifique se o Node está rodando.");
        }

    } else {
        alert("A cafeteria está fechada. Horário: 08:00 às 22:00.");
    }
}