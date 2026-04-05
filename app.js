/**
 * ═══════════════════════════════════════════════════════════════════
 *  VAULT — app.js
 *  Senior Full-Stack MVP · Plantillas Digitales
 *
 *  Módulos:
 *  1. DATA LAYER      — Catálogo JSON de productos
 *  2. CART ENGINE     — Carrito con persistencia en localStorage
 *  3. UI RENDERER     — Renderizado de productos y carrito
 *  4. PAYPAL FLOW     — Smart Buttons SDK integration
 *  5. CRYPTO FLOW     — Modal USDT TRC20/ERC20
 *  6. DELIVERY ENGINE — EmailJS post-pago (delivery automation)
 *  7. INIT            — Bootstrap de la app
 * ═══════════════════════════════════════════════════════════════════
 */

'use strict';

/* ──────────────────────────────────────────────────────────────────
   1. DATA LAYER — Catálogo de Productos
   ─────────────────────────────────────────────────────────────────
   Arquitectura JSON: cada producto tiene id único, nombre, precio
   en USD, descripción corta, categoría (negocios|finanzas|organizacion)
   e imagen_url (se puede reemplazar con imágenes reales).
   ──────────────────────────────────────────────────────────────── */

const PRODUCTS_CATALOG = [
  {
    id: "PRD-001",
    nombre: "Business Model Canvas Pro",
    precio: 19.00,
    descripcion: "Lienzo estratégico completo con guía de uso, ejemplos reales y versión editable en Notion y Excel.",
    categoria: "negocios",
    imagen_url: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&q=80",
    /** Enlace de descarga que se enviará por email post-pago */
    download_url: "https://drive.google.com/your-file-id-001"
  },
  {
    id: "PRD-002",
    nombre: "Financial Dashboard 2025",
    precio: 27.00,
    descripcion: "Dashboard de finanzas personales y empresariales con proyecciones, KPIs y alertas automáticas en Google Sheets.",
    categoria: "finanzas",
    imagen_url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80",
    download_url: "https://drive.google.com/your-file-id-002"
  },
  {
    id: "PRD-003",
    nombre: "Notion HQ — Sistema de Vida",
    precio: 22.00,
    descripcion: "Sistema de productividad, gestión de proyectos, hábitos y objetivos en una sola workspace de Notion.",
    categoria: "organizacion",
    imagen_url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80",
    download_url: "https://drive.google.com/your-file-id-003"
  },
  {
    id: "PRD-004",
    nombre: "Pitch Deck Master Template",
    precio: 35.00,
    descripcion: "50 slides premium en PowerPoint y Keynote, diseñadas para rondas seed y Series A. Incluye guía de storytelling.",
    categoria: "negocios",
    imagen_url: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&q=80",
    download_url: "https://drive.google.com/your-file-id-004"
  },
  {
    id: "PRD-005",
    nombre: "Budget Tracker Avanzado",
    precio: 15.00,
    descripcion: "Hoja de cálculo de presupuesto mensual con categorías automáticas, gráficos dinámicos y resumen anual.",
    categoria: "finanzas",
    imagen_url: "https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=600&q=80",
    download_url: "https://drive.google.com/your-file-id-005"
  },
  {
    id: "PRD-006",
    nombre: "SOPs & Procesos Corporativos",
    precio: 29.00,
    descripcion: "Pack de 20 procedimientos estándar editables: onboarding, ventas, soporte, operaciones y RRHH.",
    categoria: "organizacion",
    imagen_url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80",
    download_url: "https://drive.google.com/your-file-id-006"
  },
  {
    id: "PRD-007",
    nombre: "Startup Financial Model",
    precio: 49.00,
    descripcion: "Modelo financiero completo: P&L proyectado, runway, unit economics, cap table y escenarios de inversión.",
    categoria: "finanzas",
    imagen_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80",
    download_url: "https://drive.google.com/your-file-id-007"
  },
  {
    id: "PRD-008",
    nombre: "Client CRM — Notion Edition",
    precio: 18.00,
    descripcion: "Sistema CRM liviano para freelancers y agencias: pipeline de ventas, seguimiento de clientes y propuestas.",
    categoria: "negocios",
    imagen_url: "https://images.unsplash.com/photo-1531973576160-7125cd663d86?w=600&q=80",
    download_url: "https://drive.google.com/your-file-id-008"
  },
  {
    id: "PRD-009",
    nombre: "Weekly Planner System",
    precio: 12.00,
    descripcion: "Planificador semanal imprimible + digital con bloques de tiempo, rituales de productividad y revisión semanal.",
    categoria: "organizacion",
    imagen_url: "https://images.unsplash.com/photo-1506784365847-bbad939e9501?w=600&q=80",
    download_url: "https://drive.google.com/your-file-id-009"
  }
];

/* ──────────────────────────────────────────────────────────────────
   CONFIGURACIÓN GLOBAL
   ──────────────────────────────────────────────────────────────── */

const CONFIG = {
  /** ⚠️ Reemplazar con tu Public Key de EmailJS antes de producción */
  EMAILJS_PUBLIC_KEY:  "YOUR_EMAILJS_PUBLIC_KEY",
  EMAILJS_SERVICE_ID:  "service_vault",
  EMAILJS_TEMPLATE_ID: "template_delivery",

  /** Wallets USDT — Reemplazar con las tuyas */
  WALLET_TRC20: "TYour_TRC20_Wallet_Address_Here",
  WALLET_ERC20: "0xYour_ERC20_Wallet_Address_Here",

  CART_STORAGE_KEY: "vault_cart_v1",
  CURRENCY: "USD",
};

/* ──────────────────────────────────────────────────────────────────
   2. CART ENGINE
   ─────────────────────────────────────────────────────────────────
   El carrito se almacena en localStorage como array de objetos
   { id, nombre, precio, imagen_url, download_url }.
   Las funciones de agregar/eliminar validan duplicados y actualizan
   el estado de la UI de forma reactiva.
   ──────────────────────────────────────────────────────────────── */

const Cart = (() => {

  /**
   * Carga el carrito desde localStorage.
   * @returns {Array} Array de items del carrito
   */
  function load() {
    try {
      return JSON.parse(localStorage.getItem(CONFIG.CART_STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  /**
   * Persiste el carrito en localStorage.
   * @param {Array} items
   */
  function save(items) {
    localStorage.setItem(CONFIG.CART_STORAGE_KEY, JSON.stringify(items));
  }

  /**
   * Agrega un producto. Valida duplicados por ID.
   * @param {Object} product — Objeto de PRODUCTS_CATALOG
   * @returns {boolean} true si fue agregado, false si ya existía
   */
  function add(product) {
    const items = load();
    const exists = items.some(item => item.id === product.id);
    if (exists) return false; // Duplicado → no agregar

    items.push({
      id:           product.id,
      nombre:       product.nombre,
      precio:       product.precio,
      imagen_url:   product.imagen_url,
      download_url: product.download_url,
    });
    save(items);
    return true;
  }

  /**
   * Elimina un producto del carrito por su ID.
   * @param {string} productId
   */
  function remove(productId) {
    const items = load().filter(item => item.id !== productId);
    save(items);
  }

  /**
   * Calcula el total del carrito en USD.
   * @returns {number}
   */
  function getTotal() {
    return load().reduce((sum, item) => sum + item.precio, 0);
  }

  /**
   * Limpia completamente el carrito (post-pago exitoso).
   */
  function clear() {
    localStorage.removeItem(CONFIG.CART_STORAGE_KEY);
  }

  /**
   * Verifica si un producto está en el carrito.
   * @param {string} productId
   * @returns {boolean}
   */
  function contains(productId) {
    return load().some(item => item.id === productId);
  }

  return { load, add, remove, getTotal, clear, contains };
})();

/* ──────────────────────────────────────────────────────────────────
   3. UI RENDERER
   ──────────────────────────────────────────────────────────────── */

const UI = (() => {

  /** Formatea un número como moneda USD */
  function formatPrice(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  /** Genera el HTML de una tarjeta de producto */
  function buildProductCard(product) {
    const inCart = Cart.contains(product.id);
    const btnIcon  = inCart ? 'check' : 'plus';
    const btnClass = inCart ? 'card-add-btn in-cart' : 'card-add-btn';
    const btnTitle = inCart ? 'Quitar del carrito' : 'Agregar al carrito';

    const categoryLabel = {
      negocios:      'Negocios',
      finanzas:      'Finanzas',
      organizacion:  'Organización',
    }[product.categoria] || product.categoria;

    return `
      <article class="product-card" data-id="${product.id}" data-category="${product.categoria}">
        <div class="card-image-wrapper">
          <span class="card-category">${categoryLabel}</span>
          <img
            class="card-image"
            src="${product.imagen_url}"
            alt="${product.nombre}"
            loading="lazy"
            onerror="this.parentElement.innerHTML='<div class=\'card-image-placeholder\'><svg width=\'32\' height=\'32\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'#3D3D3D\' stroke-width=\'1.5\'><path d=\'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z\'/></svg></div>'"
          />
        </div>
        <div class="card-body">
          <h3 class="card-title">${product.nombre}</h3>
          <p class="card-desc">${product.descripcion}</p>
          <div class="card-footer">
            <span class="card-price">${formatPrice(product.precio)}</span>
            <button
              class="${btnClass}"
              data-id="${product.id}"
              onclick="handleAddToCart('${product.id}')"
              aria-label="${btnTitle}"
              title="${btnTitle}"
            >
              <i data-lucide="${btnIcon}" style="width:16px;height:16px;"></i>
            </button>
          </div>
        </div>
      </article>
    `;
  }

  /** Renderiza todos los productos en el grid */
  function renderProducts(products) {
    const grid = document.getElementById('products-grid');
    const count = document.getElementById('product-count');
    if (!grid) return;

    grid.innerHTML = products.map(buildProductCard).join('');
    if (count) count.textContent = `${products.length} plantilla${products.length !== 1 ? 's' : ''} disponible${products.length !== 1 ? 's' : ''}`;

    // Re-inicializar iconos Lucide en los nuevos elementos
    lucide.createIcons();
  }

  /** Renderiza los items del carrito en el sidebar */
  function renderCartItems() {
    const items     = Cart.load();
    const container = document.getElementById('cart-items');
    const footer    = document.getElementById('cart-footer');
    const empty     = document.getElementById('cart-empty');
    const totalEl   = document.getElementById('cart-total');
    const badge     = document.getElementById('cart-badge');

    if (!container) return;

    const hasItems = items.length > 0;

    // Toggle empty state
    if (empty)  empty.style.display  = hasItems ? 'none' : 'flex';
    if (footer) footer.classList.toggle('hidden', !hasItems);

    // Cart badge
    if (badge) {
      badge.textContent = items.length;
      badge.classList.toggle('hidden', !hasItems);
    }

    // Total
    if (totalEl) totalEl.textContent = formatPrice(Cart.getTotal());

    // Items HTML
    const itemsHTML = items.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <img
          class="cart-item-img"
          src="${item.imagen_url}"
          alt="${item.nombre}"
          onerror="this.src='data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'60\' height=\'60\' viewBox=\'0 0 60 60\'><rect fill=\'%232A2A2A\' width=\'60\' height=\'60\' rx=\'6\'/></svg>'"
        />
        <div class="cart-item-details">
          <p class="cart-item-name">${item.nombre}</p>
          <p class="cart-item-price">${formatPrice(item.precio)}</p>
        </div>
        <button
          class="cart-item-remove"
          onclick="handleRemoveFromCart('${item.id}')"
          aria-label="Eliminar ${item.nombre}"
          title="Eliminar"
        >
          <i data-lucide="x" style="width:14px;height:14px;"></i>
        </button>
      </div>
    `).join('');

    // Reemplaza solo los items (preserva el #cart-empty oculto)
    const dynamicItems = container.querySelectorAll('.cart-item');
    dynamicItems.forEach(el => el.remove());
    container.insertAdjacentHTML('afterbegin', itemsHTML);

    // Actualizar botones "in-cart" en el grid de productos
    updateProductCardButtons();

    lucide.createIcons();
  }

  /** Actualiza el estado visual de los botones en el grid */
  function updateProductCardButtons() {
    document.querySelectorAll('[data-id].card-add-btn, .card-add-btn[data-id]').forEach(btn => {
      const id = btn.dataset.id;
      const inCart = Cart.contains(id);
      btn.classList.toggle('in-cart', inCart);
      const icon = btn.querySelector('[data-lucide]');
      if (icon) icon.setAttribute('data-lucide', inCart ? 'check' : 'plus');
    });
    lucide.createIcons();
  }

  return { renderProducts, renderCartItems, formatPrice, updateProductCardButtons };
})();

/* ──────────────────────────────────────────────────────────────────
   ACCIONES DEL CARRITO (expuestas al HTML via onclick)
   ──────────────────────────────────────────────────────────────── */

function handleAddToCart(productId) {
  const product = PRODUCTS_CATALOG.find(p => p.id === productId);
  if (!product) return;

  const added = Cart.add(product);
  if (!added) {
    // Producto ya en carrito → eliminarlo (toggle)
    Cart.remove(productId);
    showToast('Producto eliminado del carrito', 'info');
  } else {
    showToast(`"${product.nombre}" agregado`, 'success');
    // Abrir carrito automáticamente
    openCart();
  }
  UI.renderCartItems();
}

function handleRemoveFromCart(productId) {
  Cart.remove(productId);
  UI.renderCartItems();
}

/* ──────────────────────────────────────────────────────────────────
   CART SIDEBAR TOGGLE
   ──────────────────────────────────────────────────────────────── */

function toggleCart() {
  const sidebar = document.getElementById('cart-sidebar');
  const overlay = document.getElementById('cart-overlay');
  const isOpen  = sidebar.classList.contains('active');
  isOpen ? closeCart() : openCart();
}

function openCart() {
  document.getElementById('cart-sidebar').classList.add('active');
  document.getElementById('cart-overlay').classList.add('active');
  document.body.style.overflow = 'hidden';
  UI.renderCartItems();
}

function closeCart() {
  document.getElementById('cart-sidebar').classList.remove('active');
  document.getElementById('cart-overlay').classList.remove('active');
  document.body.style.overflow = '';
}

/* ──────────────────────────────────────────────────────────────────
   FILTER DE PRODUCTOS
   ──────────────────────────────────────────────────────────────── */

function filterProducts(category, triggerEl) {
  // Actualizar pills activas
  document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
  if (triggerEl) triggerEl.classList.add('active');

  const filtered = category === 'all'
    ? PRODUCTS_CATALOG
    : PRODUCTS_CATALOG.filter(p => p.categoria === category);

  UI.renderProducts(filtered);
}

/* ──────────────────────────────────────────────────────────────────
   6. DELIVERY ENGINE — EmailJS
   ─────────────────────────────────────────────────────────────────
   IMPORTANTE: Esta función SÓLO debe llamarse desde los callbacks
   de confirmación de PayPal (onApprove) o del flujo de USDT
   (después de validar el hash). NUNCA debe dispararse sin la
   confirmación del proveedor de pagos para evitar entregas falsas.
   ──────────────────────────────────────────────────────────────── */

async function triggerDelivery({ email, paymentMethod, transactionId, items }) {
  /**
   * Construye la lista de links de descarga para el template de email.
   * En producción, estos links deberían ser URLs firmadas y temporales
   * (ej. AWS S3 presigned URLs o Google Drive con expiración).
   */
  const downloadLinks = items.map(item =>
    `• ${item.nombre}: ${item.download_url}`
  ).join('\n');

  const templateParams = {
    to_email:        email,
    payment_method:  paymentMethod,
    transaction_id:  transactionId,
    download_links:  downloadLinks,
    total_amount:    UI.formatPrice(Cart.getTotal()),
    /** Nombre de la tienda para el template */
    store_name:      'VAULT Digital',
  };

  try {
    /**
     * emailjs.send() devuelve una Promise. Lanzará si falla.
     * El template en EmailJS debe usar las variables:
     * {{to_email}}, {{payment_method}}, {{transaction_id}},
     * {{download_links}}, {{total_amount}}, {{store_name}}
     */
    await emailjs.send(
      CONFIG.EMAILJS_SERVICE_ID,
      CONFIG.EMAILJS_TEMPLATE_ID,
      templateParams
    );

    console.log(`✅ Delivery enviado a ${email} via EmailJS`);
    return true;

  } catch (error) {
    console.error('❌ Error al enviar email de entrega:', error);
    /**
     * En producción, registrar el error en un servicio como Sentry
     * y re-intentar o notificar al operador para envío manual.
     */
    throw error;
  }
}

/* ──────────────────────────────────────────────────────────────────
   4. PAYPAL SMART BUTTONS
   ─────────────────────────────────────────────────────────────────
   Los Smart Buttons de PayPal se renderizan dentro del sidebar.
   El flujo es:
   1. createOrder()  → crea la orden con el total calculado en tiempo real
   2. onApprove()    → captura el pago y, SÓLO si es exitoso, llama
                       a triggerDelivery() para enviar el email.
   3. onError()      → muestra error sin disparar entrega.
   ──────────────────────────────────────────────────────────────── */

function initPayPalButtons() {
  /** Esperar a que el SDK de PayPal esté disponible */
  if (typeof paypal === 'undefined') {
    console.warn('PayPal SDK no cargado aún. Reintentando en 2s...');
    setTimeout(initPayPalButtons, 2000);
    return;
  }

  paypal.Buttons({
    style: {
      layout:  'vertical',
      color:   'gold',
      shape:   'rect',
      label:   'pay',
      tagline: false,
      height:  40,
    },

    /**
     * createOrder() — Se llama cuando el usuario hace click en PayPal.
     * Recalcula el total en tiempo real desde el carrito para evitar
     * manipulaciones del cliente.
     */
    createOrder(data, actions) {
      const total = Cart.getTotal();
      if (total <= 0) {
        Swal.fire({
          icon:             'warning',
          title:            'Carrito vacío',
          text:             'Agrega al menos un producto antes de pagar.',
          background:       '#161616',
          color:            '#F5F0E8',
          confirmButtonColor: '#C9A96E',
        });
        return Promise.reject(new Error('Cart is empty'));
      }

      const email = document.getElementById('buyer-email')?.value?.trim();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        Swal.fire({
          icon:             'warning',
          title:            'Email requerido',
          text:             'Ingresa tu email para recibir los archivos.',
          background:       '#161616',
          color:            '#F5F0E8',
          confirmButtonColor: '#C9A96E',
        });
        return Promise.reject(new Error('Email required'));
      }

      return actions.order.create({
        purchase_units: [{
          description: 'Vault Digital Templates',
          amount: {
            currency_code: CONFIG.CURRENCY,
            value: total.toFixed(2),
            breakdown: {
              item_total: {
                currency_code: CONFIG.CURRENCY,
                value: total.toFixed(2),
              }
            }
          },
          /** Opcional: desglose por item para el recibo de PayPal */
          items: Cart.load().map(item => ({
            name:        item.nombre.substring(0, 127),
            unit_amount: { currency_code: CONFIG.CURRENCY, value: item.precio.toFixed(2) },
            quantity:    '1',
          }))
        }]
      });
    },

    /**
     * onApprove() — Se ejecuta SÓLO cuando PayPal captura el pago exitosamente.
     * Este es el único punto donde se llama a triggerDelivery().
     * ─────────────────────────────────────────────────────────────
     * SEGURIDAD IMPORTANTE: En producción, la captura (actions.order.capture)
     * debe realizarse en el servidor backend (Netlify Function / API).
     * El frontend NUNCA debe ser la fuente de verdad del pago.
     * El backend debe verificar el paymentID con la API de PayPal antes
     * de enviar el email de entrega.
     */
    async onApprove(data, actions) {
      try {
        /** Captura el pago — en producción, mover al backend */
        const order = await actions.order.capture();

        const email       = document.getElementById('buyer-email')?.value?.trim();
        const items       = Cart.load();
        const transId     = order.id || data.orderID;
        const payerEmail  = order.payer?.email_address || email;

        /**
         * ⚠️ FLUJO DE ENTREGA:
         * 1. El pago fue capturado exitosamente por PayPal
         * 2. Llamamos a triggerDelivery() — DESPUÉS de la confirmación
         * 3. Limpiamos el carrito SÓLO si el email fue enviado
         */
        await triggerDelivery({
          email:         payerEmail || email,
          paymentMethod: 'PayPal',
          transactionId: transId,
          items,
        });

        Cart.clear();
        UI.renderCartItems();
        closeCart();

        Swal.fire({
          icon:             'success',
          title:            '¡Pago completado!',
          html:             `Tu pedido ha sido procesado.<br/>Los archivos llegarán a <strong>${payerEmail || email}</strong> en los próximos minutos.`,
          background:       '#161616',
          color:            '#F5F0E8',
          confirmButtonColor: '#C9A96E',
          confirmButtonText: 'Perfecto',
        });

      } catch (err) {
        console.error('Error en onApprove:', err);
        Swal.fire({
          icon:             'error',
          title:            'Error al procesar',
          text:             'El pago fue capturado pero hubo un error al enviar los archivos. Contacta a soporte con tu Transaction ID.',
          background:       '#161616',
          color:            '#F5F0E8',
          confirmButtonColor: '#C9A96E',
        });
      }
    },

    onError(err) {
      console.error('PayPal Error:', err);
      /**
       * No se llama a triggerDelivery(). El pago no fue confirmado.
       */
      Swal.fire({
        icon:             'error',
        title:            'Error en el pago',
        text:             'Hubo un problema con PayPal. Intenta de nuevo o usa USDT.',
        background:       '#161616',
        color:            '#F5F0E8',
        confirmButtonColor: '#C9A96E',
      });
    },

    onCancel() {
      showToast('Pago cancelado', 'info');
    }

  }).render('#paypal-button-container');
}

/* ──────────────────────────────────────────────────────────────────
   5. CRYPTO FLOW — Modal USDT
   ──────────────────────────────────────────────────────────────── */

/** Red activa seleccionada en el modal */
let currentNetwork = 'TRC20';

function openCryptoModal() {
  const total = Cart.getTotal();
  if (total <= 0) {
    Swal.fire({
      icon: 'warning',
      title: 'Carrito vacío',
      text: 'Agrega productos antes de pagar.',
      background: '#161616',
      color: '#F5F0E8',
      confirmButtonColor: '#C9A96E',
    });
    return;
  }

  // Pre-rellenar el email desde el sidebar si existe
  const sidebarEmail = document.getElementById('buyer-email')?.value?.trim();
  const cryptoEmail  = document.getElementById('crypto-email');
  if (cryptoEmail && sidebarEmail) cryptoEmail.value = sidebarEmail;

  // Mostrar monto en el modal
  document.getElementById('usdt-amount').textContent = UI.formatPrice(total);

  // Setear la dirección de wallet según la red actual
  switchNetwork(currentNetwork);

  document.getElementById('crypto-modal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeCryptoModal() {
  document.getElementById('crypto-modal').classList.add('hidden');
  document.body.style.overflow = '';
}

function switchNetwork(network, btnEl) {
  currentNetwork = network;

  const addressEl = document.getElementById('wallet-address');
  addressEl.textContent = network === 'TRC20'
    ? CONFIG.WALLET_TRC20
    : CONFIG.WALLET_ERC20;

  // Actualizar tabs
  document.querySelectorAll('.network-tab').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.includes(network));
  });
}

function copyWalletAddress() {
  const address = document.getElementById('wallet-address')?.textContent?.trim();
  if (!address) return;

  navigator.clipboard.writeText(address).then(() => {
    showToast('Dirección copiada', 'success');
  }).catch(() => {
    showToast('No se pudo copiar. Copia manualmente.', 'info');
  });
}

/**
 * submitCryptoPayment()
 * ─────────────────────────────────────────────────────────────────
 * FLUJO DE SEGURIDAD USDT:
 * 1. Validar que el hash no esté vacío
 * 2. (En producción) Llamar a una Netlify Function o API propia
 *    que verifique el hash en la blockchain (TronScan API / Etherscan API)
 *    y confirme: monto correcto, dirección correcta, ≥ 1 confirmación.
 * 3. SÓLO si la API confirma → triggerDelivery()
 * 4. En este MVP simulamos la verificación con un timeout.
 * ─────────────────────────────────────────────────────────────────
 */
async function submitCryptoPayment() {
  const txHash  = document.getElementById('tx-hash')?.value?.trim();
  const email   = document.getElementById('crypto-email')?.value?.trim();

  // Validaciones client-side
  if (!txHash || txHash.length < 20) {
    showToast('Ingresa un Transaction ID válido', 'warning');
    return;
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast('Ingresa un email válido para recibir los archivos', 'warning');
    return;
  }

  // Loading state
  const submitBtn = document.querySelector('#crypto-modal .btn-primary');
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<svg class="animate-spin" style="width:16px;height:16px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity=".25"/><path d="M21 12a9 9 0 01-9 9" stroke-linecap="round"/></svg> Verificando en blockchain...';
  submitBtn.disabled = true;

  try {
    /**
     * ── PRODUCCIÓN: Reemplazar el timeout con una llamada real ──
     *
     * const verifyRes = await fetch('/.netlify/functions/verify-crypto', {
     *   method: 'POST',
     *   headers: { 'Content-Type': 'application/json' },
     *   body: JSON.stringify({ txHash, network: currentNetwork, expectedAmount: Cart.getTotal() })
     * });
     *
     * if (!verifyRes.ok) throw new Error('Hash no verificado');
     * const { verified } = await verifyRes.json();
     * if (!verified) throw new Error('Transacción no confirmada o monto incorrecto');
     *
     * ── MVP: Simulación de verificación ──
     */
    await new Promise(resolve => setTimeout(resolve, 3000)); // Simula latencia API
    const simulatedVerified = true; // En producción: resultado de la API

    if (!simulatedVerified) {
      throw new Error('Hash no verificado');
    }

    const items = Cart.load();

    /** SÓLO después de verificar → enviar email */
    await triggerDelivery({
      email,
      paymentMethod: `USDT (${currentNetwork})`,
      transactionId: txHash,
      items,
    });

    Cart.clear();
    UI.renderCartItems();
    closeCryptoModal();
    closeCart();

    Swal.fire({
      icon:             'success',
      title:            '¡Pago verificado!',
      html:             `Hash confirmado.<br/>Los archivos llegarán a <strong>${email}</strong> en minutos.`,
      background:       '#161616',
      color:            '#F5F0E8',
      confirmButtonColor: '#C9A96E',
      confirmButtonText: 'Excelente',
    });

  } catch (err) {
    console.error('Error USDT payment:', err);
    Swal.fire({
      icon:             'error',
      title:            'Verificación fallida',
      text:             'No pudimos confirmar tu transacción. Verifica el hash e intenta de nuevo, o contacta soporte.',
      background:       '#161616',
      color:            '#F5F0E8',
      confirmButtonColor: '#C9A96E',
    });
  } finally {
    submitBtn.innerHTML = originalText;
    submitBtn.disabled  = false;
    lucide.createIcons();
  }
}

/* ──────────────────────────────────────────────────────────────────
   TOAST HELPER (usando SweetAlert2 en modo toast)
   ──────────────────────────────────────────────────────────────── */

const Toast = Swal.mixin({
  toast:            true,
  position:         'bottom-end',
  showConfirmButton: false,
  timer:            3000,
  timerProgressBar: true,
  background:       '#1F1F1F',
  color:            '#F5F0E8',
  customClass: { popup: 'swal-toast-vault' },
});

function showToast(message, icon = 'success') {
  Toast.fire({ icon, title: message });
}

/* ──────────────────────────────────────────────────────────────────
   NAVBAR SCROLL EFFECT
   ──────────────────────────────────────────────────────────────── */

function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

/* ──────────────────────────────────────────────────────────────────
   7. INIT — Bootstrap de la app
   ──────────────────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  /**
   * 1. Inicializar EmailJS con la Public Key
   *    ⚠️ Reemplazar "YOUR_EMAILJS_PUBLIC_KEY" con tu clave real.
   */
  if (typeof emailjs !== 'undefined') {
    emailjs.init(CONFIG.EMAILJS_PUBLIC_KEY);
  }

  /** 2. Renderizar productos */
  UI.renderProducts(PRODUCTS_CATALOG);

  /** 3. Renderizar estado inicial del carrito (desde localStorage) */
  UI.renderCartItems();

  /** 4. Inicializar PayPal Buttons */
  initPayPalButtons();

  /** 5. Navbar scroll effect */
  initNavbarScroll();

  /** 6. Inicializar todos los iconos Lucide */
  lucide.createIcons();

  /** 7. Cerrar modal con Escape */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeCryptoModal();
      closeCart();
    }
  });

  /** 8. Animación de entrada para el hero */
  document.querySelector('.hero-content')?.classList.add('hero-animate');

  console.log(`
  ╔══════════════════════════════════╗
  ║  VAULT Digital — MVP Loaded ✓   ║
  ║  ${PRODUCTS_CATALOG.length} productos · localStorage OK  ║
  ╚══════════════════════════════════╝
  `);
});
