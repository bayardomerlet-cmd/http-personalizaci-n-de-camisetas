const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const COLOR_OPTIONS = [
    { name: 'Blanco', value: 'blanco' }, { name: 'Negro', value: 'negro' },
    { name: 'Rojo', value: 'rojo' }, { name: 'Azul marino', value: 'azul marino' },
    { name: 'Verde militar', value: 'verde militar' }, { name: 'Gris claro', value: 'gris claro' },
    { name: 'Amarillo', value: 'amarillo' }
];
const WA_NUMBER = "83573260";

let currentSetSize = 3;
let shirtsConfig = [];
let setsQty = 1;
let designText = "";
let customerName = "";
let customerEmail = "";

// Elementos DOM
const setSizeSelect = document.getElementById('setSizeSelect');
const setsQuantityInput = document.getElementById('setsQuantity');
const designInfoInput = document.getElementById('designInfo');
const customerNameInput = document.getElementById('customerName');
const customerEmailInput = document.getElementById('customerEmail');
const tableContainer = document.getElementById('shirtTableContainer');
const dynamicLinkDisplay = document.getElementById('dynamicLinkDisplay');
const copyLinkBtn = document.getElementById('copyLinkBtn');
const refreshLinkBtn = document.getElementById('refreshLinkBtn');
const whatsappBtn = document.getElementById('whatsappBtn');
const copySummaryBtn = document.getElementById('copySummaryBtn');

// Renderizar tabla dinámica
function renderShirtTable() {
    while (shirtsConfig.length < currentSetSize) shirtsConfig.push({ size: 'M', colorValue: 'blanco' });
    while (shirtsConfig.length > currentSetSize) shirtsConfig.pop();

    let html = '<table><thead><tr><th>#</th><th>Talla</th><th>Color</th></tr></thead><tbody>';
    for (let i = 0; i < currentSetSize; i++) {
        const conf = shirtsConfig[i];
        let sizeSelect = `<select class="shirt-size" data-idx="${i}">`;
        SIZE_OPTIONS.forEach(sz => {
            sizeSelect += `<option value="${sz}" ${conf.size === sz ? 'selected' : ''}>${sz}</option>`;
        });
        sizeSelect += `</select>`;
        let colorSelect = `<select class="shirt-color" data-idx="${i}">`;
        COLOR_OPTIONS.forEach(col => {
            colorSelect += `<option value="${col.value}" ${conf.colorValue === col.value ? 'selected' : ''}>${col.name}</option>`;
        });
        colorSelect += `</select>`;
        html += `<tr><td>${i+1}</td><td>${sizeSelect}</td><td>${colorSelect}</td></tr>`;
    }
    html += '</tbody></table>';
    tableContainer.innerHTML = html;

    document.querySelectorAll('.shirt-size').forEach(select => {
        select.addEventListener('change', (e) => {
            const idx = parseInt(select.dataset.idx);
            if (!isNaN(idx)) shirtsConfig[idx].size = select.value;
            updateUrlFromState(false);
        });
    });
    document.querySelectorAll('.shirt-color').forEach(select => {
        select.addEventListener('change', (e) => {
            const idx = parseInt(select.dataset.idx);
            if (!isNaN(idx)) shirtsConfig[idx].colorValue = select.value;
            updateUrlFromState(false);
        });
    });
}

function syncFromInputs() {
    setsQty = parseInt(setsQuantityInput.value) || 1;
    if (setsQty < 1) setsQty = 1;
    designText = designInfoInput.value;
    customerName = customerNameInput.value;
    customerEmail = customerEmailInput.value;
    const newSize = parseInt(setSizeSelect.value);
    if (newSize !== currentSetSize) {
        currentSetSize = newSize;
        renderShirtTable();
    }
    updateUrlFromState(false);
}

function getFullConfig() {
    return {
        setSize: currentSetSize,
        setsQty: setsQty,
        design: designText,
        customer: customerName,
        email: customerEmail,
        shirts: shirtsConfig.map(s => ({ size: s.size, color: s.colorValue }))
    };
}

function buildQueryString() {
    const cfg = getFullConfig();
    const params = new URLSearchParams();
    params.set('setSize', cfg.setSize);
    params.set('qty', cfg.setsQty);
    if (cfg.design) params.set('design', cfg.design);
    if (cfg.customer) params.set('cust', cfg.customer);
    if (cfg.email) params.set('email', cfg.email);
    cfg.shirts.forEach((s, i) => {
        params.set(`s${i}`, s.size);
        params.set(`c${i}`, s.color);
    });
    return params.toString();
}

function updateUrlFromState(updateHistory = false) {
    const query = buildQueryString();
    const fullUrl = window.location.origin + window.location.pathname + '?' + query;
    dynamicLinkDisplay.innerText = fullUrl;
    if (updateHistory) window.history.replaceState(null, '', '?' + query);
}

function loadStateFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    let setSize = parseInt(urlParams.get('setSize'));
    if (!isNaN(setSize) && setSize >= 2 && setSize <= 10) currentSetSize = setSize;
    else currentSetSize = 3;
    setSizeSelect.value = currentSetSize;

    let qty = parseInt(urlParams.get('qty'));
    setsQty = (!isNaN(qty) && qty >= 1) ? qty : 1;
    setsQuantityInput.value = setsQty;

    designText = urlParams.get('design') || '';
    designInfoInput.value = designText;
    customerName = urlParams.get('cust') || '';
    customerNameInput.value = customerName;
    customerEmail = urlParams.get('email') || '';
    customerEmailInput.value = customerEmail;

    shirtsConfig = [];
    for (let i = 0; i < currentSetSize; i++) {
        let size = urlParams.get(`s${i}`) || 'M';
        let color = urlParams.get(`c${i}`) || 'blanco';
        if (!SIZE_OPTIONS.includes(size)) size = 'M';
        if (!COLOR_OPTIONS.some(c => c.value === color)) color = 'blanco';
        shirtsConfig.push({ size, colorValue: color });
    }
    renderShirtTable();
    updateUrlFromState(false);
}

function generateOrderSummary() {
    const cfg = getFullConfig();
    let txt = `📋 SOLICITUD DE COMPRA - SETS DE CAMISETAS\n`;
    txt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    txt += `📦 Cantidad de sets: ${cfg.setsQty}\n`;
    txt += `👕 Camisetas por set: ${cfg.setSize}\n`;
    txt += `🎨 Diseño: ${cfg.design || "Sin especificar"}\n`;
    if (cfg.customer) txt += `🧑‍💼 Solicitante: ${cfg.customer}\n`;
    if (cfg.email) txt += `📧 Email: ${cfg.email}\n`;
    txt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    txt += `🛒 Composición de cada set:\n`;
    cfg.shirts.forEach((s, idx) => {
        const colorName = COLOR_OPTIONS.find(c => c.value === s.color)?.name || s.color;
        txt += `   Camiseta ${idx+1}: Talla ${s.size} | Color: ${colorName}\n`;
    });
    txt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    txt += `Total camisetas: ${cfg.setSize * cfg.setsQty} unidades\n✅ Espero cotización, gracias.`;
    return txt;
}

function sendWhatsApp() {
    const msg = encodeURIComponent(generateOrderSummary());
    window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, '_blank');
}

async function copyLink() {
    try {
        await navigator.clipboard.writeText(dynamicLinkDisplay.innerText);
        alert('Enlace copiado');
    } catch(e) { alert('Error al copiar'); }
}

async function copySummary() {
    try {
        await navigator.clipboard.writeText(generateOrderSummary());
        alert('Resumen copiado');
    } catch(e) { alert('Error'); }
}

// Eventos
setSizeSelect.addEventListener('change', () => syncFromInputs());
setsQuantityInput.addEventListener('input', () => syncFromInputs());
designInfoInput.addEventListener('input', () => syncFromInputs());
customerNameInput.addEventListener('input', () => syncFromInputs());
customerEmailInput.addEventListener('input', () => syncFromInputs());
refreshLinkBtn.addEventListener('click', () => { syncFromInputs(); updateUrlFromState(true); alert('Enlace actualizado'); });
copyLinkBtn.addEventListener('click', copyLink);
copySummaryBtn.addEventListener('click', copySummary);
whatsappBtn.addEventListener('click', sendWhatsApp);

// Iniciar
loadStateFromURL();
function enviarPedido() {
    const mensaje = generateOrderSummary(); // Llama a la función de arriba
    const telefono = "+5058357260"; // Reemplaza con tu número real
    
    // Asegúrate de usar backticks ` para envolver la URL completa
    const url = "https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}";
    
    window.open(url, '_blank');
    
    // Limpia el carrito
    reiniciarCarrito();
}
// Variable para llevar la cuenta de prendas
let totalPrendas = 0;




