document.addEventListener('DOMContentLoaded', () => { const A = window.ASSETS || {}; document.querySelectorAll('[data-img]').forEach(el => { el.src = A[el.dataset.img] || ''; }); const $ = s => document.querySelector(s); const notify = s => { document.querySelector('.notice')?.remove(); let e = document.createElement('div'); e.className = 'notice'; e.textContent = s; document.body.append(e); setTimeout(() => e.remove(), 4000); }; let user = JSON.parse(localStorage.getItem('alexUser') || 'null'); const acc = $('#account');
const isCustomerPage = ['carrinho.html', 'perfil.html', 'equipamentos.html'].some(page => String(location.pathname || '').endsWith(page));
const customer = (() => { try { return JSON.parse(localStorage.getItem('alexCustomerProfile') || 'null') || {}; } catch { return {}; } })();
if (acc && (user || isCustomerPage)) {
    const customerName = customer.name || (user && !user.admin ? user.name : 'Marina Sena');
    const displayName = isCustomerPage ? customerName : user.name;
    const firstName = String(displayName).split(' ')[0];
    const profileUrl = isCustomerPage || !user.admin ? 'perfil.html' : 'admin.html';
    acc.innerHTML = `<a href="carrinho.html" title="Carrinho" aria-label="Abrir carrinho">🛒 <span id="cartCount">0</span></a>
        <div class="customer-menu">
          <button class="customer-menu-trigger" id="profileToggle" type="button" aria-expanded="false" aria-controls="profileDropdown" aria-label="Abrir opções do perfil de ${firstName}">
            <span class="customer-avatar-small">${firstName.charAt(0).toUpperCase()}</span><span>${displayName}</span><span aria-hidden="true">⌄</span>
          </button>
          <div class="customer-dropdown" id="profileDropdown" hidden>
            <a href="${profileUrl}">Meu perfil</a>
            <a href="carrinho.html">Meu orçamento</a>
            <button type="button" id="logout">Sair da conta</button>
          </div>
        </div>`;
    const toggle = $('#profileToggle'), menu = $('#profileDropdown');
    toggle.addEventListener('click', () => { menu.hidden = !menu.hidden; toggle.setAttribute('aria-expanded', String(!menu.hidden)); });
    document.addEventListener('click', e => { if (!e.target.closest('.customer-menu')) { menu.hidden = true; toggle.setAttribute('aria-expanded', 'false'); } });
    $('#logout').addEventListener('click', () => { localStorage.removeItem('alexUser'); location.href = 'login.html'; });
    const avatar = acc.querySelector('.customer-avatar-small');
    if (isCustomerPage && customer.photo) avatar.style.backgroundImage = `url("${customer.photo}")`;
}
// Controles compartilhados das paginas do cliente. Nao sao exibidos em login ou admin.
const customerWidgetsPages = new Set(['index.html', 'carrinho.html', 'equipamentos.html', 'perfil.html']);
const currentPage = (location.pathname || '').split('/').pop() || 'index.html';
if (location.pathname && customerWidgetsPages.has(currentPage)) {
    const widgets = document.createElement('div');
    widgets.className = 'customer-floating-controls';
    widgets.innerHTML = `
        <div class="chat-control">
            <span class="chat-tooltip" id="chatTooltip" role="tooltip">Olá, posso ajudar?</span>
            <button type="button" class="chat" id="chat" aria-label="Abrir atendimento virtual" aria-expanded="false" aria-controls="chatPanel" aria-describedby="chatTooltip">
                <img class="chat-robot-icon" src="img/chatbot-referencia.png" alt="" aria-hidden="true">
            </button>
            <section class="chat-panel" id="chatPanel" aria-label="Conversa com assistente virtual" hidden>
                <header class="chat-panel-header"><span>Atendimento Alex Amaro</span><button type="button" id="chatClose" aria-label="Fechar conversa">×</button></header>
                <div class="chat-messages" id="chatMessages" role="log" aria-live="polite">
                    <p class="chat-message bot">Olá! 👋 Seja bem-vindo(a) à Alex Amaro | Som & Luz! Como posso ajudar com seu evento?</p>
                </div>
                <form class="chat-reply-form" id="chatReplyForm">
                    <label class="visually-hidden" for="chatReply">Sua mensagem</label>
                    <input id="chatReply" type="text" placeholder="Escreva sua mensagem..." maxlength="500" required autocomplete="off">
                    <button type="submit" aria-label="Enviar mensagem">Enviar</button>
                </form>
            </section>
        </div>
        <button type="button" class="access" id="access" aria-label="Aumentar tamanho do texto" aria-pressed="false">A+</button>`;
    document.body.appendChild(widgets);
}
document.querySelector('.mobile-menu')?.addEventListener('click', () => $('.nav').classList.toggle('open')); const chatButton = $('#chat');
const chatPanel = $('#chatPanel');
const setChatOpen = open => {
    if (!chatPanel || !chatButton) return;
    chatPanel.hidden = !open;
    chatButton.setAttribute('aria-expanded', String(open));
    if (open) $('#chatReply')?.focus();
    else chatButton.focus();
};
chatButton?.addEventListener('click', () => setChatOpen(chatPanel.hidden));
$('#chatClose')?.addEventListener('click', () => setChatOpen(false));
$('#chatReplyForm')?.addEventListener('submit', event => {
    event.preventDefault();
    const input = $('#chatReply');
    const message = input.value.trim();
    if (!message) return;
    const messages = $('#chatMessages');
    const userMessage = document.createElement('p');
    userMessage.className = 'chat-message user';
    userMessage.textContent = message;
    messages.appendChild(userMessage);
    const response = document.createElement('p');
    response.className = 'chat-message bot';
    response.append('Que bom receber sua mensagem! Nossa equipe pode ajudar com equipamentos, disponibilidade e orçamentos. ');
    const link = document.createElement('a');
    link.href = 'https://wa.me/5519123456789?text=' + encodeURIComponent('Olá, Alex Amaro! ' + message);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'Fale com a gente pelo WhatsApp';
    response.appendChild(link);
    messages.appendChild(response);
    input.value = '';
    messages.scrollTop = messages.scrollHeight;
});
document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && chatPanel && !chatPanel.hidden) setChatOpen(false);
}); $('#access')?.addEventListener('click', () => { document.body.classList.toggle('large-text'); document.documentElement.classList.toggle('customer-large-text', document.body.classList.contains('large-text')); $('#access').setAttribute('aria-pressed', String(document.body.classList.contains('large-text'))); notify('Tamanho do texto ajustado'); }); const getCart = () => JSON.parse(localStorage.getItem('alexCart') || '[]'); const saveCart = c => { localStorage.setItem('alexCart', JSON.stringify(c)); updateCount(); }; function updateCount() { let n = getCart().reduce((a, b) => a + b.qty, 0); if ($('#cartCount'))
    $('#cartCount').textContent = n; } updateCount(); function add(name) { let c = getCart(), item = c.find(x => x.name === name); if (item)
    item.qty++;
else
    c.push({ name, qty: 1 }); saveCart(c); renderCart(); notify(name + ' adicionado ao orçamento'); } document.querySelectorAll('[data-product]').forEach(b => b.addEventListener('click', () => add(b.dataset.product))); let days = $('[name=day]'), months = $('[name=month]'), years = $('[name=year]'); if (days) {
    for (let i = 1; i <= 31; i++)
        days.add(new Option(i, i));
    ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'].forEach((m, i) => months.add(new Option(m, i + 1)));
    for (let y = 2026; y >= 1920; y--)
        years.add(new Option(y, y));
    days.value = '15';
    months.value = '7';
    years.value = '2000';
} $('#registerForm')?.addEventListener('submit', e => { e.preventDefault(); let f = e.target; if (f.elements.namedItem("password").value !== f.elements.namedItem("confirm").value) {
    notify('As senhas não coincidem');
    return;
} let u = { name: f.elements.namedItem("name").value.trim(), contact: f.elements.namedItem("contact").value.trim(), password: f.elements.namedItem("password").value, admin: false }; localStorage.setItem('alexRegistered', JSON.stringify(u)); localStorage.setItem('alexUser', JSON.stringify(u)); location.href = 'index.html'; }); $('#loginForm')?.addEventListener('submit', e => { e.preventDefault(); let f = e.target, reg = JSON.parse(localStorage.getItem('alexRegistered') || 'null'); if (reg && (f.elements.namedItem("user").value === reg.contact || f.elements.namedItem("user").value === reg.name) && f.elements.namedItem("password").value === reg.password) {
    localStorage.setItem('alexUser', JSON.stringify(reg));
    location.href = 'index.html';
}
else if (f.elements.namedItem("user").value === 'admin' && f.elements.namedItem("password").value === 'admin123') {
    localStorage.setItem('alexUser', JSON.stringify({ name: 'Alex Amaro', admin: true }));
    location.href = 'admin.html';
}
else
    notify('Dados não encontrados. Cadastre-se ou confira suas credenciais.'); }); $('#forgot')?.addEventListener('click', () => notify('Para recuperar sua senha, entre em contato: contato@alexamaro.com.br')); $('#google')?.addEventListener('click', () => notify('Login Google requer integração externa e não está disponível na versão estática.')); const products = { 'Mesa DMX': 'mesa', 'Laser XYZ': 'laser', 'Moving Heads ABC': 'moving', 'MOVING HEADS': 'moving', 'PAR LED': 'par', 'LASER': 'laser', 'Moving Heads XYZ': 'moving', 'Moving Heads GHI': 'purple', 'Máquina de Fumaça Premium': 'fumaca' }; function renderCart() { let area = $('#cartItems'); if (!area)
    return; let c = getCart(); if (!c.length && !localStorage.getItem('alexCart')) {
    c = [{ name: 'Mesa DMX', qty: 1 }, { name: 'Laser XYZ', qty: 1 }, { name: 'Moving Heads ABC', qty: 1 }];
    saveCart(c);
} area.innerHTML = c.map((x, i) => '<div class="cart-item"><input type="checkbox" aria-label="Selecionar ' + x.name + '" ' + (i === 0 ? 'checked' : '') + '><div class="cart-card"><img src="' + (A[products[x.name]] || A.moving) + '" alt="' + x.name + '"><strong>' + x.name + '</strong><input type="number" min="1" value="' + x.qty + '" aria-label="Quantidade" data-qty="' + i + '"><a href="equipamentos.html">Encontre produtos similares</a><button title="Remover produto" data-remove="' + i + '">×</button></div></div>').join(''); area.querySelectorAll('[data-qty]').forEach(e => e.onchange = () => { let c = getCart(); c[+e.dataset.qty].qty = Math.max(1, Number(e.value) || 1); saveCart(c); renderCart(); }); area.querySelectorAll('[data-remove]').forEach(e => e.onclick = () => { let c = getCart(); c.splice(+e.dataset.remove, 1); saveCart(c); renderCart(); }); } renderCart(); window.addEventListener('storage', event => { if (event.key === 'alexCart') { updateCount(); renderCart(); } }); $('#removeInactive')?.addEventListener('click', () => { $('.inactive').remove(); $('#removeInactive').remove(); notify('Equipamentos indisponíveis removidos'); }); $('#requestQuote')?.addEventListener('click', () => { let c = getCart(); if (!c.length) {
    notify('Selecione um produto');
    return;
} let text = 'Olá! Gostaria de solicitar um orçamento para: ' + c.map(x => x.qty + 'x ' + x.name).join(', ') + (($('#coupon')?.value) ? '. Cupom: ' + $('#coupon').value : ''); window.open('https://wa.me/5519123456789?text=' + encodeURIComponent(text), '_blank', 'noopener'); }); let d = new Date(2026, 4, 1); function calendar() { if (!$('#calDays'))
    return; $('#calMonth').textContent = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).replace(/^./, x => x.toUpperCase()); let out = ['Do', 'Se', 'Te', 'Qu', 'Qu', 'Se', 'Sá'].map(x => '<span><b>' + x + '</b></span>').join(''); for (let i = 0; i < d.getDay(); i++)
    out += '<span></span>'; let total = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate(); for (let i = 1; i <= total; i++)
    out += '<span class="' + (i === 18 && d.getMonth() === 4 ? 'today' : '') + '">' + i + '</span>'; $('#calDays').innerHTML = out; } calendar(); $('#prevMonth')?.addEventListener('click', () => { d.setMonth(d.getMonth() - 1); calendar(); }); $('#nextMonth')?.addEventListener('click', () => { d.setMonth(d.getMonth() + 1); calendar(); }); document.querySelectorAll('[data-admin]').forEach(b => b.onclick = () => { document.querySelectorAll('[data-admin]').forEach(x => x.classList.remove('active')); b.classList.add('active'); let title = b.dataset.admin; $('#adminTitle').textContent = title; $('#dashboard').hidden = title !== 'Dashboard'; let panel = $('#adminPanel'); panel.hidden = title === 'Dashboard'; if (title !== 'Dashboard') {
    let editing = /Novo|Editar|Alterar|Dados|Cadastro|produto|pacote|colaborador/i.test(title);
    panel.innerHTML = '<h2>' + title + '</h2>' + (editing ? '<form id="adminForm"><input required placeholder="Nome / descrição"><input placeholder="Informações adicionais"><button class="red-btn">Salvar</button></form>' : '<p>Nenhum registro disponível nesta demonstração estática.</p>');
    $('#adminForm')?.addEventListener('submit', e => { e.preventDefault(); notify('Informações registradas nesta demonstração'); e.target.reset(); });
} }); $('#adminSearch')?.addEventListener('input', e => { document.querySelectorAll('[data-admin]').forEach(b => b.style.display = b.textContent.toLowerCase().includes(e.target.value.toLowerCase()) ? '' : 'none'); }); let q = new URLSearchParams(location.search).get('busca'); if (q && $('#equipment-main'))
    notify('Busca: ' + q); });

