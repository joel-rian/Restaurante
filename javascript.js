// Inicializar carrinho do localStorage com tratamento de erro
let carrinho = [];

try {
    const carrinhoSalvo = localStorage.getItem("carrinho");
    carrinho = carrinhoSalvo ? JSON.parse(carrinhoSalvo) : [];
} catch (e) {
    console.error('Erro ao carregar carrinho do localStorage:', e);
    carrinho = [];
}

// Salvar carrinho no localStorage
function salvarCarrinho() {
    try {
        localStorage.setItem("carrinho", JSON.stringify(carrinho));
    } catch (e) {
        console.error('Erro ao salvar carrinho no localStorage:', e);
    }
}

// Atualizar exibição do carrinho
function atualizarCarrinho() {
    const lista = document.getElementById("carrinho-itens");
    const totalEl = document.getElementById("carrinho-total");
    const contador = document.getElementById("contador-carrinho");

    if (!lista || !totalEl || !contador) {
        console.error('Elementos do carrinho não encontrados no DOM');
        return;
    }

    lista.innerHTML = "";
    let total = 0;

    carrinho.forEach((item, index) => {
        total += item.preco;

        // Criar elementos de forma segura (sem innerHTML com dados do usuário)
        const div = document.createElement('div');
        div.className = 'carrinho-item';
        
        const strong = document.createElement('strong');
        strong.textContent = item.nome;
        
        const button = document.createElement('button');
        button.textContent = 'Remover';
        button.style.cssText = 'margin-top:5px;color:red;background:none;border:none;cursor:pointer;';
        button.onclick = () => removerItem(index);
        
        div.appendChild(strong);
        div.appendChild(button);
        lista.appendChild(div);
    });

    totalEl.textContent = `R$ ${total.toFixed(2)}`;
    contador.textContent = carrinho.length;

    salvarCarrinho();
}

// Remover item do carrinho
function removerItem(index) {
    if (index >= 0 && index < carrinho.length) {
        carrinho.splice(index, 1);
        atualizarCarrinho();
    }
}

// Abrir modal com dados do produto
function abrirModal(nomeProduto, preco, ingredientes, opcoes) {
    const modal = document.getElementById('modal-pedido');
    const titulo = document.getElementById('modal-titulo');
    const descricao = document.getElementById('modal-descricao');
    const precoEl = document.getElementById('modal-preco');
    const modalOpcoes = document.getElementById('modal-opcoes');

    if (!modal || !titulo || !descricao || !precoEl || !modalOpcoes) {
        console.error('Elementos do modal não encontrados');
        return;
    }

    // Usar textContent para evitar XSS
    titulo.textContent = nomeProduto;
    descricao.textContent = ingredientes.join(', ');
    precoEl.textContent = `R$ ${preco.toFixed(2)}`;
    
    // Limpar opções anteriores
    modalOpcoes.innerHTML = '';
    
    // Gerar opções dinamicamente
    if (opcoes && Object.keys(opcoes).length > 0) {
        for (let [chave, valores] of Object.entries(opcoes)) {
            const h4 = document.createElement('h4');
            h4.textContent = chave;
            modalOpcoes.appendChild(h4);
            
            valores.forEach(valor => {
                const label = document.createElement('label');
                const input = document.createElement('input');
                input.type = 'radio';
                input.name = chave;
                input.value = valor;
                
                label.appendChild(input);
                label.appendChild(document.createTextNode(valor));
                modalOpcoes.appendChild(label);
            });
        }
    }
    
    // Mostrar modal
    modal.style.display = 'block';
}

// Fechar modal
function fecharModal() {
    const modal = document.getElementById('modal-pedido');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Fechar modal ao clicar fora dele
window.onclick = function(event) {
    const modal = document.getElementById('modal-pedido');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};

// Abrir carrinho
const iconeCarrinho = document.getElementById("icone-carrinho");
if (iconeCarrinho) {
    iconeCarrinho.onclick = () => {
        const carrinho = document.getElementById("carrinho");
        if (carrinho) {
            carrinho.classList.add("aberto");
        }
    };
}

// Fechar carrinho
const fecharCarrinho = document.getElementById("fechar-carrinho");
if (fecharCarrinho) {
    fecharCarrinho.onclick = () => {
        const carrinho = document.getElementById("carrinho");
        if (carrinho) {
            carrinho.classList.remove("aberto");
        }
    };
}

// Adicionar item ao carrinho
const btnAdicionarCarrinho = document.getElementById('btn-adicionar-carrinho');
if (btnAdicionarCarrinho) {
    btnAdicionarCarrinho.addEventListener('click', function() {
        const titulo = document.getElementById('modal-titulo');
        const precoEl = document.getElementById('modal-preco');
        
        if (!titulo || !precoEl) {
            console.error('Elementos do modal não encontrados');
            return;
        }

        const nomeProduto = titulo.textContent;
        const precoTexto = precoEl.textContent.replace("R$ ", "").replace(",", ".");
        const preco = parseFloat(precoTexto);

        if (isNaN(preco)) {
            console.error('Preço inválido');
            return;
        }

        let opcoesEscolhidas = "";
        const modalOpcoes = document.getElementById('modal-opcoes');
        if (modalOpcoes) {
            const inputsSelecionados = modalOpcoes.querySelectorAll('input:checked');
            inputsSelecionados.forEach(op => {
                opcoesEscolhidas += `${op.name}: ${op.value} `;
            });
        }

        carrinho.push({
            nome: nomeProduto,
            preco: preco,
            opcoes: opcoesEscolhidas.trim()
        });

        atualizarCarrinho();
        fecharModal();
    });
}

// Finalizar pedido
const finalizarPedido = document.getElementById("finalizar-pedido");
if (finalizarPedido) {
    finalizarPedido.onclick = () => {
        if (carrinho.length === 0) {
            alert("Seu carrinho está vazio!");
            return;
        }

        let texto = "🍽 *Pedido Realizado*\n\n";

        carrinho.forEach(item => {
            texto += `• *${item.nome}* - R$ ${item.preco.toFixed(2)}\n`;
            if (item.opcoes) {
                texto += `    ↳ ${item.opcoes}\n`;
            }
        });

        const total = carrinho.reduce((s, i) => s + i.preco, 0);
        texto += `\nTotal: *R$ ${total.toFixed(2)}*`;

        // Obter número do WhatsApp do atributo data
        const numero = document.body.dataset.whatsapp || "558899999999";
        const url = `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;

        window.open(url, "_blank");
    };
}

// Inicializar carrinho na página
document.addEventListener('DOMContentLoaded', function() {
    atualizarCarrinho();
});


// ============================================
// FUNÇÕES DE RESERVA DE MESAS
// ============================================

// Dados das mesas disponíveis
const mesas = [
    {
        id: 1,
        numero: 'Mesa 1',
        descricao: 'Mesa ao lado da janela com vista para a rua',
        capacidade: '2 pessoas',
        disponivel: true
    },
    {
        id: 2,
        numero: 'Mesa 2',
        descricao: 'Mesa perto da porta de entrada, fácil acesso',
        capacidade: '4 pessoas',
        disponivel: true
    },
    {
        id: 3,
        numero: 'Mesa 3',
        descricao: 'Mesa no canto aconchegante do restaurante',
        capacidade: '2 pessoas',
        disponivel: true
    },
    {
        id: 4,
        numero: 'Mesa 4',
        descricao: 'Mesa grande próxima ao balcão, ideal para grupos',
        capacidade: '6 pessoas',
        disponivel: true
    },
    {
        id: 5,
        numero: 'Mesa 5',
        descricao: 'Mesa na área externa com ambiente agradável',
        capacidade: '4 pessoas',
        disponivel: true
    },
    {
        id: 6,
        numero: 'Mesa 6',
        descricao: 'Mesa privada no fundo do restaurante',
        capacidade: '8 pessoas',
        disponivel: true
    }
];

// Reservas armazenadas
let reservas = [];

try {
    const reservasSalvas = localStorage.getItem("reservas");
    reservas = reservasSalvas ? JSON.parse(reservasSalvas) : [];
} catch (e) {
    console.error('Erro ao carregar reservas do localStorage:', e);
    reservas = [];
}

// Abrir modal de reserva
function abrirModalReserva() {
    const modal = document.getElementById('modal-reserva');
    if (modal) {
        modal.style.display = 'block';
        preencherTabelaMesas();
    }
}

// Fechar modal de reserva
function fecharModalReserva() {
    const modal = document.getElementById('modal-reserva');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Preencher tabela com as mesas
function preencherTabelaMesas() {
    const corpo = document.getElementById('tabela-mesas-corpo');
    if (!corpo) {
        console.error('Elemento tabela-mesas-corpo não encontrado');
        return;
    }

    corpo.innerHTML = '';

    mesas.forEach(mesa => {
        const tr = document.createElement('tr');
        
        const tdNumero = document.createElement('td');
        tdNumero.textContent = mesa.numero;
        
        const tdDescricao = document.createElement('td');
        tdDescricao.textContent = mesa.descricao;
        
        const tdCapacidade = document.createElement('td');
        tdCapacidade.textContent = mesa.capacidade;
        
        const tdAcao = document.createElement('td');
        const btn = document.createElement('button');
        btn.className = 'btn-reservar';
        btn.textContent = 'Reservar';
        btn.onclick = () => abrirFormularioReserva(mesa);
        
        tdAcao.appendChild(btn);
        
        tr.appendChild(tdNumero);
        tr.appendChild(tdDescricao);
        tr.appendChild(tdCapacidade);
        tr.appendChild(tdAcao);
        
        corpo.appendChild(tr);
    });
}

// Abrir formulário de reserva
function abrirFormularioReserva(mesa) {
    const nome = prompt('Qual é o seu nome?');
    if (!nome) return;

    const telefone = prompt('Qual é o seu telefone?');
    if (!telefone) return;

    const data = prompt('Qual é a data da reserva? (DD/MM/YYYY)');
    if (!data) return;

    const hora = prompt('Qual é a hora da reserva? (HH:MM)');
    if (!hora) return;

    const pessoas = prompt('Quantas pessoas?');
    if (!pessoas) return;

    // Salvar reserva
    const reserva = {
        id: Date.now(),
        mesa: mesa.numero,
        mesaId: mesa.id,
        nome: nome,
        telefone: telefone,
        data: data,
        hora: hora,
        pessoas: pessoas,
        descricao: mesa.descricao,
        dataCriacao: new Date().toLocaleString('pt-BR')
    };

    reservas.push(reserva);
    salvarReservas();

    // Mostrar confirmação
    alert(`✅ Reserva confirmada!\n\nMesa: ${mesa.numero}\nNome: ${nome}\nData: ${data}\nHora: ${hora}\nPessoas: ${pessoas}\n\nObrigado pela preferência!`);

    // Enviar para WhatsApp
    enviarReservaWhatsApp(reserva, mesa);

    // Fechar modal
    fecharModalReserva();
}

// Salvar reservas no localStorage
function salvarReservas() {
    try {
        localStorage.setItem("reservas", JSON.stringify(reservas));
    } catch (e) {
        console.error('Erro ao salvar reservas no localStorage:', e);
    }
}

// Enviar reserva para WhatsApp
function enviarReservaWhatsApp(reserva, mesa) {
    let texto = "🍽 *Reserva de Mesa Confirmada*\n\n";
    texto += `Mesa: *${reserva.mesa}*\n`;
    texto += `Descrição: ${reserva.descricao}\n`;
    texto += `Nome: *${reserva.nome}*\n`;
    texto += `Telefone: ${reserva.telefone}\n`;
    texto += `Data: *${reserva.data}*\n`;
    texto += `Hora: *${reserva.hora}*\n`;
    texto += `Pessoas: *${reserva.pessoas}*\n\n`;
    texto += `Obrigado! Esperamos por você! 😊`;

    const numero = document.body.dataset.whatsapp || "558899999999";
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;

    window.open(url, "_blank");
}

// Fechar modal ao clicar fora (para reserva também)
window.onclick = function(event) {
    const modalPedido = document.getElementById('modal-pedido');
    const modalReserva = document.getElementById('modal-reserva');
    
    if (event.target === modalPedido) {
        modalPedido.style.display = 'none';
    }
    if (event.target === modalReserva) {
        modalReserva.style.display = 'none';
    }
};


// ============================================
// FUNÇÕES DE AGENDAMENTO DE EVENTOS
// ============================================

// Eventos armazenados
let eventos = [];

try {
    const eventosSalvos = localStorage.getItem("eventos");
    eventos = eventosSalvos ? JSON.parse(eventosSalvos) : [];
} catch (e) {
    console.error('Erro ao carregar eventos do localStorage:', e);
    eventos = [];
}

// Abrir modal de agendamento de eventos
function abrirModalEvento() {
    const modal = document.getElementById('modal-evento');
    if (modal) {
        modal.style.display = 'block';
        // Definir data mínima como hoje
        const dataInput = document.getElementById('data-evento');
        if (dataInput) {
            const hoje = new Date().toISOString().split('T')[0];
            dataInput.min = hoje;
        }
    }
}

// Fechar modal de agendamento de eventos
function fecharModalEvento() {
    const modal = document.getElementById('modal-evento');
    if (modal) {
        modal.style.display = 'none';
    }
    // Limpar formulário
    const formulario = document.getElementById('formulario-evento');
    if (formulario) {
        formulario.reset();
    }
}

// Salvar eventos no localStorage
function salvarEventos() {
    try {
        localStorage.setItem("eventos", JSON.stringify(eventos));
    } catch (e) {
        console.error('Erro ao salvar eventos no localStorage:', e);
    }
}

// Processar envio do formulário de evento
const formularioEvento = document.getElementById('formulario-evento');
if (formularioEvento) {
    formularioEvento.addEventListener('submit', function(e) {
        e.preventDefault();

        // Obter valores do formulário
        const tipoEvento = document.getElementById('tipo-evento').value;
        const dataEvento = document.getElementById('data-evento').value;
        const horaEvento = document.getElementById('hora-evento').value;
        const pessoasEvento = document.getElementById('pessoas-evento').value;
        const orcamentoEvento = document.getElementById('orcamento-evento').value;
        const nomeOrganizador = document.getElementById('nome-organizador').value;
        const telefoneOrganizador = document.getElementById('telefone-organizador').value;
        const emailOrganizador = document.getElementById('email-organizador').value;
        const descricaoEvento = document.getElementById('descricao-evento').value;

        // Obter serviços selecionados
        let servicosSelecionados = [];
        const checkboxes = document.querySelectorAll('input[name="servicos"]:checked');
        checkboxes.forEach(checkbox => {
            servicosSelecionados.push(checkbox.value);
        });

        // Validar campos obrigatórios
        if (!tipoEvento || !dataEvento || !horaEvento || !pessoasEvento || !orcamentoEvento || !nomeOrganizador || !telefoneOrganizador) {
            alert('Por favor, preencha todos os campos obrigatórios!');
            return;
        }

        // Validar data (não pode ser no passado)
        const dataSelecionada = new Date(dataEvento);
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        if (dataSelecionada < hoje) {
            alert('Por favor, selecione uma data futura!');
            return;
        }

        // Criar objeto de evento
        const evento = {
            id: Date.now(),
            tipo: tipoEvento,
            data: dataEvento,
            hora: horaEvento,
            pessoas: pessoasEvento,
            orcamento: parseFloat(orcamentoEvento),
            nome: nomeOrganizador,
            telefone: telefoneOrganizador,
            email: emailOrganizador,
            descricao: descricaoEvento,
            servicos: servicosSelecionados,
            dataCriacao: new Date().toLocaleString('pt-BR')
        };

        // Salvar evento
        eventos.push(evento);
        salvarEventos();

        // Mostrar confirmação
        const tiposEvento = {
            'aniversario': 'Aniversário',
            'casamento': 'Casamento',
            'surpresa': 'Festa Surpresa',
            'corporativo': 'Evento Corporativo',
            'reuniao': 'Reunião de Negócios',
            'formatura': 'Formatura',
            'noivado': 'Noivado',
            'outro': 'Outro'
        };

        const mensagemConfirmacao = `✅ Evento agendado com sucesso!\n\nTipo: ${tiposEvento[tipoEvento]}\nData: ${dataEvento}\nHora: ${horaEvento}\nPessoas: ${pessoasEvento}\nOrçamento: R$ ${parseFloat(orcamentoEvento).toFixed(2)}\n\nEntraremos em contato em breve!`;
        alert(mensagemConfirmacao);

        // Enviar para WhatsApp
        enviarEventoWhatsApp(evento, tiposEvento[tipoEvento]);

        // Fechar modal
        fecharModalEvento();
    });
}

// Enviar evento para WhatsApp
function enviarEventoWhatsApp(evento, tipoEvento) {
    let texto = "🎉 *Agendamento de Evento*\n\n";
    texto += `Tipo: *${tipoEvento}*\n`;
    texto += `Data: *${evento.data}*\n`;
    texto += `Hora: *${evento.hora}*\n`;
    texto += `Pessoas: *${evento.pessoas}*\n`;
    texto += `Orçamento: *R$ ${evento.orcamento.toFixed(2)}*\n\n`;
    texto += `Organizador: *${evento.nome}*\n`;
    texto += `Telefone: ${evento.telefone}\n`;
    
    if (evento.email) {
        texto += `Email: ${evento.email}\n`;
    }
    
    if (evento.descricao) {
        texto += `\nObservações: ${evento.descricao}\n`;
    }
    
    if (evento.servicos.length > 0) {
        texto += `\nServiços Desejados:\n`;
        evento.servicos.forEach(servico => {
            texto += `• ${servico}\n`;
        });
    }
    
    texto += `\nEntraremos em contato em breve para confirmar os detalhes! 😊`;

    const numero = document.body.dataset.whatsapp || "558899999999";
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;

    window.open(url, "_blank");
}

// Fechar modal ao clicar fora (atualizado para incluir evento)
const originalWindowOnclick = window.onclick;
window.onclick = function(event) {
    const modalPedido = document.getElementById('modal-pedido');
    const modalReserva = document.getElementById('modal-reserva');
    const modalEvento = document.getElementById('modal-evento');
    
    if (event.target === modalPedido && modalPedido) {
        modalPedido.style.display = 'none';
    }
    if (event.target === modalReserva && modalReserva) {
        modalReserva.style.display = 'none';
    }
    if (event.target === modalEvento && modalEvento) {
        modalEvento.style.display = 'none';
    }
};

function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const menuBtn = document.querySelector(".menu-toggle");

    if (!sidebar || !menuBtn) return;

    const isOpen = sidebar.classList.toggle("active");

    menuBtn.classList.toggle("hidden", isOpen);
    document.body.classList.toggle("no-scrool", isOpen);

    sidebar.setAttribute("aria-hidden", !isOpen);
}

document.querySelectorAll(".sidebar-nav a").forEach(link => {
  link.addEventListener("click", function (e) {
    e.preventDefault(); // evita o salto brusco

    const destino = this.getAttribute("href");
    const alvo = document.querySelector(destino);

    if (alvo) {
      // fecha o sidebar
      const sidebar = document.getElementById("sidebar");
      sidebar.classList.remove("active");

      // libera o scroll
      document.body.style.overflow = "auto";

      // volta botão do menu
      const menuToggle = document.querySelector(".menu-toggle");
      if (menuToggle) menuToggle.style.display = "block";

      // scroll suave até a seção
      setTimeout(() => {
        alvo.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }, 200);
    }
  });
});
