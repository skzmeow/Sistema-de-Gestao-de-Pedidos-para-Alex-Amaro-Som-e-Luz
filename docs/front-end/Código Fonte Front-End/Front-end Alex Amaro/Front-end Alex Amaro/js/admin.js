'use strict';
(() => {
  const $ = (selector) => document.querySelector(selector);
  const currency = (value) => Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const safe = (value) => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const localDate = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const today = new Date();
  const base = new Date(today.getFullYear(), today.getMonth(), 1);
  const at = (offset, day) => localDate(new Date(base.getFullYear(), base.getMonth() + offset, day));
  const samples = [
    { id: 'demo1', title: 'Show — Espaço Central', date: at(0, 8), time: '19:00', client: 'Marina Costa', location: 'Espaço Central', service: 'Iluminação', status: 'Confirmado', value: 6800, notes: 'Montagem às 14h; moving heads e mesa DMX.' },
    { id: 'demo2', title: 'Formatura Turma 2026', date: at(0, 15), time: '20:00', client: 'Comissão de Formatura', location: 'Salão Imperial', service: 'Pacote completo', status: 'Pendente', value: 12500, notes: 'Aguardando confirmação de equipamentos.' },
    { id: 'demo3', title: 'Evento corporativo', date: at(0, 22), time: '09:00', client: 'Empresa Horizonte', location: 'Centro de Convenções', service: 'Sonorização', status: 'Confirmado', value: 4200, notes: 'Microfones e mesa de som.' },
    { id: 'demo4', title: 'Casamento Ana e Pedro', date: at(0, 27), time: '17:30', client: 'Ana Ribeiro', location: 'Villa Jardim', service: 'Efeitos especiais', status: 'Confirmado', value: 9500, notes: 'Máquina de fumaça e iluminação cênica.' },
    { id: 'demo5', title: 'Festival de música', date: at(1, 5), time: '18:00', client: 'Produções Alfa', location: 'Parque Municipal', service: 'Estrutura', status: 'Pendente', value: 16000, notes: 'Verificar disponibilidade de treliças.' },
    { id: 'demo6', title: 'Aniversário de 15 anos', date: at(-1, 19), time: '20:00', client: 'Juliana Martins', location: 'Buffet Aurora', service: 'Iluminação', status: 'Concluído', value: 5300, notes: 'Serviço finalizado.' }
  ];
  // Estoque demonstrativo. Alterações e reservas são armazenadas somente neste navegador.
  const stockKey = 'alexEquipmentStockV1';
  const catalog = [
    { id: 'moving', name: 'Moving Heads', image: 'moving.jpg', qty: 12 },
    { id: 'par', name: 'PAR LED', image: 'par.jpg', qty: 24 },
    { id: 'laser', name: 'Laser', image: 'laser.webp', qty: 4 },
    { id: 'dmx', name: 'Mesa DMX', image: 'mesa.jpg', qty: 3 },
    { id: 'som', name: 'Mesa de som', image: 'mesa.jpg', qty: 3 },
    { id: 'fumaca', name: 'Máquina de fumaça', image: 'fumaca.jpg', qty: 6 }
  ];
  let stock;
  try {
    const stored = JSON.parse(localStorage.getItem(stockKey));
    stock = Array.isArray(stored) && catalog.every(item => stored.some(x => x.id === item.id && Number.isInteger(x.qty) && x.qty >= 0)) ? stored : catalog;
  } catch { stock = catalog; }
  const saveStock = () => {
    try { localStorage.setItem(stockKey, JSON.stringify(stock)); return true; }
    catch (error) { console.error('Falha ao salvar estoque:', error); toast('Erro ao salvar estoque.'); return false; }
  };
  const activeStatus = status => status === 'Confirmado' || status === 'Concluído';
  // Eventos são reservas de um dia inteiro: dois eventos na mesma data concorrem pelo estoque.
  const booked = (date, id, excludeId) => events.filter(event => event.id !== excludeId && event.date === date && activeStatus(event.status)).reduce((sum, event) => sum + Number((event.equipment || {})[id] || 0), 0);
  const remaining = (date, id, excludeId) => Math.max(0, (stock.find(x => x.id === id)?.qty || 0) - booked(date, id, excludeId));
  const requests = data => Object.fromEntries(catalog.map(item => [item.id, Number((data.equipment || {})[item.id] || 0)]));
  const conflicts = data => activeStatus(data.status) ? catalog.filter(item => requests(data)[item.id] > remaining(data.date, item.id, data.id)).map(item => `${item.name}: solicitado ${requests(data)[item.id]}, disponível ${remaining(data.date, item.id, data.id)}`) : [];
  const equipmentNames = event => catalog.filter(item => Number((event.equipment || {})[item.id]) > 0).map(item => `${item.name} × ${event.equipment[item.id]}`).join(', ') || 'Nenhum equipamento reservado';
  const storeKey = 'alexAdminEventsV2';
  // Normalize registros antigos antes de qualquer renderização. Dados incompletos
  // não devem impedir que a Visão Geral seja exibida.
  const normalizeEvent = (item) => {
    if (!item || typeof item !== 'object') return null;
    const date = typeof item.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(item.date) ? item.date : null;
    if (!date) return null;
    const status = ['Pendente', 'Confirmado', 'Concluído', 'Cancelado'].includes(item.status) ? item.status : 'Pendente';
    const equipment = {};
    for (const product of catalog) {
      const quantity = Number(item.equipment?.[product.id] ?? 0);
      equipment[product.id] = Number.isSafeInteger(quantity) && quantity >= 0 ? quantity : 0;
    }
    const amount = Number(item.value);
    return {
      id: String(item.id || `legacy-${date}-${Math.random().toString(36).slice(2, 10)}`),
      title: String(item.title || 'Evento sem título'),
      date,
      time: typeof item.time === 'string' && /^\d{2}:\d{2}$/.test(item.time) ? item.time : '18:00',
      client: String(item.client || 'Cliente não informado'),
      location: String(item.location || 'Local não informado'),
      service: String(item.service || 'Iluminação'),
      status,
      value: Number.isFinite(amount) && amount >= 0 ? amount : 0,
      notes: String(item.notes || ''),
      equipment
    };
  };
  const parseEvents = (value) => {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.map(normalizeEvent).filter(Boolean) : null;
    } catch (error) {
      console.warn('Registros locais inválidos; iniciando com dados de exemplo.', error);
      return null;
    }
  };
  const storedEvents = parseEvents(localStorage.getItem(storeKey));
  let events = storedEvents ?? samples.map(normalizeEvent);
  const save = () => {
    try {
      localStorage.setItem(storeKey, JSON.stringify(events));
      return true;
    } catch (error) {
      console.error('Falha ao salvar eventos:', error);
      toast('Não foi possível salvar. Verifique o armazenamento do navegador.');
      return false;
    }
  };
  saveStock();
  if (localStorage.getItem(storeKey) === null) save();
  let view = 'dashboard';
  let month = new Date(today.getFullYear(), today.getMonth(), 1);
  let selected = localDate(today);
  let equipmentDate = localDate(today);
  let statusFilter = 'Todos';
  let search = '';
  const labels = { dashboard: 'Visão geral', agenda: 'Agenda de eventos', pedidos: 'Orçamentos', equipamentos: 'Equipamentos', clientes: 'Clientes', financeiro: 'Financeiro' };
  function toast(message) { const element = $('#toast'); element.textContent = message; element.classList.add('show'); clearTimeout(toast.timer); toast.timer = setTimeout(() => element.classList.remove('show'), 3500); }
  function badge(status) { return `<span class="pill ${status.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}">${safe(status)}</span>`; }
  function sorted() { return [...events].sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`)); }
  function openEditor(id, date) {
    const item = events.find(event => event.id === id);
    const form = $('#eventForm'); form.reset();
    // Preencha somente os campos de dados; não atribua valores vazios aos selects.
    const defaults = {
      id: '', title: '', date: date || selected, time: '18:00',
      client: '', location: '', service: 'Iluminação',
      status: 'Pendente', value: '0', notes: ''
    };
    for (const [name, fallback] of Object.entries(defaults)) {
      const field = form.elements.namedItem(name);
      if (field) field.value = item ? String(item[name] ?? fallback) : fallback;
    }
    $('#equipmentError').textContent = '';
    $('#dialogTitle').textContent = item ? 'Editar evento' : 'Novo evento';
    $('#equipmentInputs').innerHTML = catalog.map(equip => `<label class="equipment-quantity">${safe(equip.name)}<input type="number" min="0" step="1" name="eq_${equip.id}" value="${Number((item?.equipment || {})[equip.id] || 0)}" aria-label="Quantidade de ${safe(equip.name)}"><small data-available="${equip.id}"></small></label>`).join('');
    const update = () => {
      const date = form.elements.namedItem('date').value;
      const status = form.elements.namedItem('status').value;
      $('#equipmentInputs').querySelectorAll('[data-available]').forEach(node => {
        const equip = stock.find(x => x.id === node.dataset.available);
        node.textContent = date ? `Disponível em ${date.split('-').reverse().join('/')}: ${remaining(date, equip.id, id)} de ${equip.qty}${!activeStatus(status) ? ' · reserva apenas ao confirmar' : ''}` : `Estoque: ${equip.qty}`;
      });
    };
    form.oninput = update;
    form.onchange = update;
    update();
    $('#eventDialog').showModal();
  }
  function eventRows(items, actions = true) {
    if (!items.length) return '<p class="empty">Nenhum evento encontrado.</p>';
    return `<div class="table-scroll"><table><thead><tr><th>Data e horário</th><th>Evento / Cliente</th><th>Serviço</th><th>Valor</th><th>Status</th>${actions ? '<th>Ações</th>' : ''}</tr></thead><tbody>${items.map(item => `<tr><td>${safe(item.date.split('-').reverse().join('/'))}<br><small class="muted">${safe(item.time)}</small></td><td><strong>${safe(item.title)}</strong><br><small class="muted">${safe(item.client)} · ${safe(item.location)}</small><br><small class="muted">${safe(equipmentNames(item))}</small></td><td>${safe(item.service)}</td><td>${currency(item.value)}</td><td>${badge(item.status)}</td>${actions ? `<td><button data-edit="${safe(item.id)}">Editar</button> <button data-delete="${safe(item.id)}">Excluir</button></td>` : ''}</tr>`).join('')}</tbody></table></div>`;
  }
  function calendarHTML() {
    const year = month.getFullYear(), number = month.getMonth();
    const start = new Date(year, number, 1).getDay();
    const total = new Date(year, number + 1, 0).getDate();
    let days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(name => `<div class="weekday">${name}</div>`).join('');
    for (let i = 0; i < start; i++) days += '<div class="day outside" aria-hidden="true"></div>';
    for (let day = 1; day <= total; day++) {
      const date = localDate(new Date(year, number, day));
      const dayEvents = sorted().filter(event => event.date === date);
      days += `<button class="day ${date === localDate(today) ? 'today' : ''} ${date === selected ? 'selected' : ''}" data-day="${date}" aria-label="${day} de ${month.toLocaleDateString('pt-BR', { month: 'long' })}, ${dayEvents.length} eventos"><span class="number">${day}</span>${dayEvents.slice(0, 2).map(event => `<span class="event-chip ${event.status === 'Pendente' ? 'pending' : event.status === 'Concluído' ? 'done' : ''}">${safe(event.time)} ${safe(event.title)}</span>`).join('')}${dayEvents.length > 2 ? `<small>+${dayEvents.length - 2}</small>` : ''}</button>`;
    }
    return `<div class="calendar-toolbar"><h2>${month.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</h2><div><button data-month="-1" aria-label="Mês anterior">‹</button> <button data-today="true">Hoje</button> <button data-month="1" aria-label="Próximo mês">›</button></div></div><div class="calendar">${days}</div>`;
  }
  function dashboard() {
    const thisMonth = events.filter(event => event.date.startsWith(localDate(month).slice(0, 7)));
    const confirmed = thisMonth.filter(event => event.status === 'Confirmado');
    const pending = thisMonth.filter(event => event.status === 'Pendente');
    const revenue = confirmed.reduce((sum, event) => sum + Number(event.value), 0);
    const months = Array.from({ length: 6 }, (_, index) => { const date = new Date(month.getFullYear(), month.getMonth() - 5 + index, 1); const key = localDate(date).slice(0, 7); return { label: date.toLocaleDateString('pt-BR', { month: 'short' }), total: events.filter(event => event.date.startsWith(key) && ['Confirmado', 'Concluído'].includes(event.status)).reduce((sum, event) => sum + Number(event.value), 0) }; });
    const maximum = Math.max(1, ...months.map(item => item.total));
    const statuses = ['Confirmado', 'Pendente', 'Concluído', 'Cancelado'];
    const upcoming = sorted().filter(event => event.date >= localDate(today) && event.status !== 'Cancelado').slice(0, 5);
    return `<div class="section-head"><div><h2>Resumo da operação</h2><p class="muted">Acompanhe eventos, orçamento e compromissos da equipe.</p></div><button class="primary" data-new="true">+ Novo evento</button></div><div class="stats"><div class="stat"><small>Eventos no mês selecionado</small><strong>${thisMonth.length}</strong><span>Agenda do mês exibido</span></div><div class="stat"><small>Receita prevista confirmada</small><strong class="accent">${currency(revenue)}</strong><span>Não representa pagamento recebido</span></div><div class="stat"><small>Orçamentos pendentes</small><strong>${pending.length}</strong><span>Aguardando aprovação</span></div><div class="stat"><small>Eventos confirmados</small><strong>${confirmed.length}</strong><span>Confirmados no mês exibido</span></div></div><div class="two-col"><section class="panel"><h3>Receita prevista por mês</h3><div class="chart" role="img" aria-label="Gráfico de barras da receita prevista nos últimos seis meses">${months.map(item => `<div class="bar-wrap"><div class="bar" title="${currency(item.total)}" style="height:${Math.max(2, item.total / maximum * 100)}%"></div><small>${safe(item.label)}</small></div>`).join('')}</div><p class="legend">Valores dos eventos confirmados e concluídos, em R$.</p></section><section class="panel"><h3>Situação dos eventos</h3>${statuses.map(status => { const count = events.filter(event => event.status === status).length; return `<div class="progress-row"><div><span>${status}</span><strong>${count}</strong></div><div class="track"><div class="fill" style="width:${events.length ? count / events.length * 100 : 0}%"></div></div></div>`; }).join('')}</section></div><div class="two-col"><section class="panel"><div class="section-head"><h3>Próximos eventos</h3><button class="outline" data-go="agenda">Ver agenda</button></div>${upcoming.length ? upcoming.map(event => `<div class="list-row"><div><strong>${safe(event.title)}</strong><small>${safe(event.date.split('-').reverse().join('/'))} às ${safe(event.time)} · ${safe(event.client)}</small></div>${badge(event.status)}</div>`).join('') : '<p class="empty">Sem eventos futuros.</p>'}</section><section class="panel"><div class="section-head"><h3>Agenda</h3><button class="outline" data-go="agenda">Abrir calendário</button></div>${calendarHTML()}</section></div>`;
  }
  function agenda() { const dayEvents = sorted().filter(event => event.date === selected); return `<div class="section-head"><p class="muted">Clique em um dia para consultar os compromissos ou adicionar um evento.</p><button class="primary" data-new="true">+ Adicionar evento</button></div><section class="panel">${calendarHTML()}</section><section class="panel" style="margin-top:20px"><div class="section-head"><h3>Eventos de ${safe(selected.split('-').reverse().join('/'))}</h3><button class="outline" data-new="${selected}">+ Neste dia</button></div>${eventRows(dayEvents)}</section>`; }
  function orders() { const filtered = sorted().filter(event => (statusFilter === 'Todos' || event.status === statusFilter) && `${event.title} ${event.client} ${event.location}`.toLowerCase().includes(search.toLowerCase())); return `<div class="section-head"><h2>Solicitações e orçamentos</h2><button class="primary" data-new="true">+ Novo orçamento / evento</button></div><p class="muted">Os valores e status são demonstrativos e podem ser editados por evento.</p><div class="filters"><input id="orderSearch" aria-label="Pesquisar orçamento" placeholder="Buscar cliente ou evento" value="${safe(search)}"><select id="statusFilter" aria-label="Filtrar status">${['Todos', 'Pendente', 'Confirmado', 'Concluído', 'Cancelado'].map(value => `<option ${value === statusFilter ? 'selected' : ''}>${value}</option>`).join('')}</select></div><section class="panel" id="ordersTable">${eventRows(filtered)}</section>`; }
  function equipment() {
    const date = equipmentDate;
    return `<div class="section-head"><div><h2>Disponibilidade de equipamentos</h2><p class="muted">Controle por data, com reservas de dia inteiro. Apenas eventos confirmados ou concluídos consomem estoque.</p></div><a class="outline" href="equipamentos.html">Ver no site ↗</a></div>
      <section class="panel"><label class="date-filter">Consultar data <input id="equipmentDate" type="date" value="${safe(date)}"></label><p class="muted">Edite o estoque total em cada cartão. A redução não pode ser menor que a quantidade já reservada em qualquer data.</p></section>
      <div class="inventory">${stock.map(item => { const reserved = booked(date, item.id); const available = remaining(date, item.id); return `<article class="inventory-card"><img src="img/${safe(item.image)}" alt="${safe(item.name)}"><h3>${safe(item.name)}</h3><div class="inventory-numbers"><span>Em estoque <strong>${item.qty}</strong></span><span>Reservados <strong>${reserved}</strong></span><span>Disponíveis <strong>${available}</strong></span></div><label class="stock-edit">Quantidade total <input type="number" min="0" step="1" data-stock="${item.id}" value="${item.qty}"></label><button class="outline" data-save-stock="${item.id}">Atualizar estoque</button></article>`; }).join('')}</div>
      <section class="panel" style="margin-top:20px"><h3>Reservas para ${safe(date.split('-').reverse().join('/'))}</h3>${eventRows(sorted().filter(item => item.date === date && activeStatus(item.status)))}</section>`;
  }
  function clients() { const clients = [...new Map(sorted().map(event => [event.client, event])).values()]; return `<div class="section-head"><h2>Clientes dos eventos</h2></div><section class="panel"><div class="table-scroll"><table><thead><tr><th>Cliente</th><th>Último evento cadastrado</th><th>Local</th><th>Status</th></tr></thead><tbody>${clients.map(item => `<tr><td>${safe(item.client)}</td><td>${safe(item.title)}</td><td>${safe(item.location)}</td><td>${badge(item.status)}</td></tr>`).join('')}</tbody></table></div></section>`; }
  function finance() { const confirmed = events.filter(event => ['Confirmado', 'Concluído'].includes(event.status)); const pending = events.filter(event => event.status === 'Pendente'); return `<div class="section-head"><h2>Visão financeira</h2></div><div class="stats"><div class="stat"><small>Receita prevista</small><strong>${currency(confirmed.reduce((sum, event) => sum + Number(event.value), 0))}</strong></div><div class="stat"><small>Propostas pendentes</small><strong>${currency(pending.reduce((sum, event) => sum + Number(event.value), 0))}</strong></div><div class="stat"><small>Eventos concluídos</small><strong>${confirmed.filter(event => event.status === 'Concluído').length}</strong></div><div class="stat"><small>Contratos confirmados</small><strong>${confirmed.filter(event => event.status === 'Confirmado').length}</strong></div></div><section class="panel"><h3>Valores previstos por evento</h3>${eventRows(sorted(), false)}</section><p class="muted">Este painel não registra recebimentos, despesas ou lucro real; os números representam valores cadastrados na agenda.</p>`; }
  function render() {
    const content = $('#content');
    $('#pageTitle').textContent = labels[view] || 'Visão geral';
    document.querySelectorAll('.nav-item').forEach(button => {
      button.classList.toggle('active', button.dataset.view === view);
    });
    try {
      const pages = { dashboard, agenda, pedidos: orders, equipamentos: equipment, clientes: clients, financeiro: finance };
      content.innerHTML = (pages[view] || dashboard)();
    } catch (error) {
      console.error('Falha ao exibir o painel:', error);
      content.innerHTML = `<section class="panel"><h2>Não foi possível carregar esta seção</h2><p>Os dados cadastrados não foram apagados. Atualize a página ou consulte o console para detalhes.</p><button class="primary" id="retryRender">Tentar novamente</button></section>`;
      content.querySelector('#retryRender')?.addEventListener('click', render);
    }
  }
  function go(target) { view = target; render(); $('.sidebar').classList.remove('open'); }
  document.querySelectorAll('.nav-item').forEach(button => button.addEventListener('click', () => go(button.dataset.view)));
  $('#menuToggle').addEventListener('click', () => $('.sidebar').classList.toggle('open'));
  $('#profileButton').addEventListener('click', () => { $('#profileMenu').hidden = !$('#profileMenu').hidden; $('#profileButton').setAttribute('aria-expanded', String(!$('#profileMenu').hidden)); });
  const logout = () => { localStorage.removeItem('alexUser'); location.href = 'login.html'; };
  $('#logout').addEventListener('click', logout); $('#profileExit').addEventListener('click', logout);
  $('#closeDialog').addEventListener('click', () => $('#eventDialog').close()); $('#cancelDialog').addEventListener('click', () => $('#eventDialog').close());
  $('#eventForm').addEventListener('submit', event => {
    event.preventDefault();
    const raw = Object.fromEntries(new FormData(event.currentTarget).entries());
    const data = Object.fromEntries(Object.entries(raw).filter(([key]) => !key.startsWith('eq_')));
    data.equipment = Object.fromEntries(catalog.map(item => [item.id, Number(raw[`eq_${item.id}`] || 0)]));
    const error = $('#equipmentError');
    error.textContent = '';

    if (!data.title.trim() || !data.date || !data.time || !data.client.trim() || !data.location.trim()) {
      error.textContent = 'Preencha os campos obrigatórios.';
      return;
    }
    if (!['Pendente', 'Confirmado', 'Concluído', 'Cancelado'].includes(data.status)) {
      error.textContent = 'Selecione um status válido.';
      return;
    }
    if (catalog.some(item => !Number.isSafeInteger(data.equipment[item.id]) || data.equipment[item.id] < 0)) {
      error.textContent = 'Informe quantidades inteiras e não negativas.';
      return;
    }
    data.value = Number(data.value);
    if (!Number.isFinite(data.value) || data.value < 0) {
      error.textContent = 'Informe um valor válido.';
      return;
    }
    const issues = conflicts(data);
    if (issues.length) {
      error.textContent = 'Estoque insuficiente: ' + issues.join(' | ');
      return;
    }

    const previous = [...events];
    if (data.id) {
      const index = events.findIndex(item => item.id === data.id);
      if (index === -1) {
        error.textContent = 'Evento não encontrado. Reabra o formulário.';
        return;
      }
      events[index] = data;
    } else {
      data.id = `evt-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      events.push(data);
    }
    if (!save()) {
      events = previous;
      error.textContent = 'Não foi possível salvar o evento neste navegador.';
      return;
    }
    selected = data.date;
    equipmentDate = data.date;
    month = new Date(Number(data.date.slice(0, 4)), Number(data.date.slice(5, 7)) - 1, 1);
    $('#eventDialog').close();
    render();
    toast('Evento salvo com sucesso.');
  });

  $('#content').addEventListener('click', event => { const button = event.target.closest('button'); if (!button) return; if (button.dataset.view) return go(button.dataset.view); if (button.dataset.go) return go(button.dataset.go); if (button.hasAttribute('data-new')) return openEditor(null, button.dataset.new === 'true' ? selected : button.dataset.new); if (button.dataset.edit) return openEditor(button.dataset.edit);
    if (button.dataset.saveStock) {
      const item = stock.find(x => x.id === button.dataset.saveStock);
      const field = document.querySelector(`[data-stock="${item.id}"]`);
      const quantity = Number(field.value);
      if (!Number.isSafeInteger(quantity) || quantity < 0) return toast('Informe uma quantidade inteira válida.');
      const dates = [...new Set(events.filter(e => activeStatus(e.status)).map(e => e.date))];
      const highest = Math.max(0, ...dates.map(date => booked(date, item.id)));
      if (quantity < highest) return toast(`Estoque insuficiente: existem ${highest} unidades reservadas em uma mesma data.`);
      const oldQty = item.qty; item.qty = quantity; if (!saveStock()) { item.qty = oldQty; return; } render(); toast('Estoque atualizado.'); return;
    } if (button.dataset.delete) { if (confirm('Excluir este evento da agenda?')) { const previous = events; events = events.filter(item => item.id !== button.dataset.delete); if (!save()) { events = previous; return; } render(); toast('Evento excluído.'); } return; } if (button.dataset.month) { month.setMonth(month.getMonth() + Number(button.dataset.month)); render(); return; } if (button.dataset.today) { month = new Date(today.getFullYear(), today.getMonth(), 1); selected = localDate(today); render(); return; } if (button.dataset.day) { selected = button.dataset.day; if (view === 'dashboard') go('agenda'); else render(); } });
  $('#content').addEventListener('input', event => { if (event.target.id === 'orderSearch') { search = event.target.value; const filtered = sorted().filter(item => (statusFilter === 'Todos' || item.status === statusFilter) && `${item.title} ${item.client} ${item.location}`.toLowerCase().includes(search.toLowerCase())); $('#ordersTable').innerHTML = eventRows(filtered); } });
  $('#content').addEventListener('change', event => { if (event.target.id === 'equipmentDate') { equipmentDate = event.target.value || localDate(today); render(); return; } if (event.target.id === 'statusFilter') { statusFilter = event.target.value; render(); } });
  window.addEventListener('storage', event => {
    if (event.key === storeKey) {
      const updated = parseEvents(event.newValue); if (updated) events = updated;
      render();
    }
    if (event.key === stockKey) {
      try { const updated = JSON.parse(event.newValue); if (Array.isArray(updated) && catalog.every(item => updated.some(x => x.id === item.id && Number.isSafeInteger(x.qty) && x.qty >= 0))) stock = updated; } catch (error) { console.warn(error); }
      render();
    }
  });
  render();
})();
