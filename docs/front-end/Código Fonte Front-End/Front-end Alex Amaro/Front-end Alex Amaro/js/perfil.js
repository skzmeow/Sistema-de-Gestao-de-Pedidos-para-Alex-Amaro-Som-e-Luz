document.addEventListener('DOMContentLoaded', () => {
    const key = 'alexCustomerProfile';
    const form = document.getElementById('profileForm');
    if (!form) return;
    const read = name => { try { return JSON.parse(localStorage.getItem(name) || 'null') || {}; } catch { return {}; } };
    const session = read('alexUser');
    const registered = read('alexRegistered');
    const profile = read(key);
    const defaults = { name: session.admin ? 'Marina Sena' : (session.name || registered.name || 'Marina Sena'), email: registered.contact && registered.contact.includes('@') ? registered.contact : '', phone: '' };
    const data = { ...defaults, ...profile };
    for (const element of form.elements) {
        if (element.name && Object.prototype.hasOwnProperty.call(data, element.name)) element.value = data[element.name] ?? '';
    }
    const picture = document.getElementById('profilePicture');
    const nameDisplay = document.getElementById('profileName');
    function updateVisuals() {
        const name = form.elements.namedItem('name').value.trim() || 'Marina Sena';
        nameDisplay.textContent = name;
        picture.textContent = name.charAt(0).toUpperCase();
        const photo = read(key).photo;
        if (photo) { picture.style.backgroundImage = `url("${photo}")`; picture.textContent = ''; }
    }
    updateVisuals();
    document.getElementById('profilePhoto').addEventListener('change', event => {
        const file = event.target.files[0];
        if (!file) return;
        if (!['image/png','image/jpeg','image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024) {
            document.getElementById('profileFeedback').textContent = 'Escolha uma imagem JPG, PNG ou WebP de até 2 MB.';
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const current = read(key);
                localStorage.setItem(key, JSON.stringify({ ...current, photo: reader.result }));
                updateVisuals();
                const small = document.querySelector('.customer-avatar-small');
                if (small) { small.style.backgroundImage = `url("${reader.result}")`; small.textContent = ''; }
                document.getElementById('profileFeedback').textContent = 'Foto atualizada.';
            } catch { document.getElementById('profileFeedback').textContent = 'Não foi possível salvar a foto. Tente uma imagem menor.'; }
        };
        reader.readAsDataURL(file);
    });
    form.addEventListener('submit', event => {
        event.preventDefault();
        if (!form.reportValidity()) return;
        const values = Object.fromEntries(new FormData(form).entries());
        try {
            localStorage.setItem(key, JSON.stringify({ ...read(key), ...values }));
            updateVisuals();
            const name = document.querySelector('.customer-menu-trigger span:nth-child(2)');
            if (name) name.textContent = values.name;
            document.getElementById('profileFeedback').textContent = 'Informações salvas com sucesso.';
        } catch { document.getElementById('profileFeedback').textContent = 'Não foi possível salvar. Verifique o armazenamento do navegador.'; }
    });
});
