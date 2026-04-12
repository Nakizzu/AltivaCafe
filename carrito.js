/* ============================================
   BARISTAS — carrito.js
   Maneja el carrito en index.html y carrito.html
   ============================================ */

/* ---------- PRODUCTOS DISPONIBLES (catálogo) ---------- */
const catalogo = {
  'cafe-irish': {
    id: 'cafe-irish',
    nombre: 'Cafe Irish',
    precio: 12900,
    precioOriginal: 15900,
    imagen: 'img/cafe-irish.jpg',
    descuento: '-19%'
  },
  'cafe-ingles': {
    id: 'cafe-ingles',
    nombre: 'Cafe Inglés',
    precio: 9900,
    precioOriginal: 13500,
    imagen: 'img/cafe-ingles.jpg',
    descuento: '-27%'
  },
  'cafe-australiano': {
    id: 'cafe-australiano',
    nombre: 'Cafe Australiano',
    precio: 8500,
    precioOriginal: null,
    imagen: 'img/cafe-australiano.jpg',
    descuento: null
  },
  'cafe-helado': {
    id: 'cafe-helado',
    nombre: 'Cafe Helado',
    precio: 10500,
    precioOriginal: null,
    imagen: 'img/cafe-helado.jpg',
    descuento: null
  },
  'cafe-viena': {
    id: 'cafe-viena',
    nombre: 'Cafe Viena',
    precio: 11500,
    precioOriginal: 15900,
    imagen: 'img/cafe-viena.jpg',
    descuento: '-28%'
  },
  'cafe-liqueurs': {
    id: 'cafe-liqueurs',
    nombre: 'Cafe Liqueurs',
    precio: 16900,
    precioOriginal: null,
    imagen: 'img/cafe-liqueurs.jpg',
    descuento: null
  }
};

/* ---------- FORMATO PESOS COLOMBIANOS ---------- */
function formatCOP(valor) {
  return '$' + valor.toLocaleString('es-CO');
}

/* ---------- STORAGE ---------- */
function obtenerCarrito() {
  try {
    return JSON.parse(localStorage.getItem('baristas_carrito')) || [];
  } catch {
    return [];
  }
}

function guardarCarrito(carrito) {
  localStorage.setItem('baristas_carrito', JSON.stringify(carrito));
}

/* ---------- OPERACIONES ---------- */
function agregarAlCarrito(productoId) {
  const producto = catalogo[productoId];
  if (!producto) return;

  const carrito = obtenerCarrito();
  const idx = carrito.findIndex(p => p.id === productoId);

  if (idx >= 0) {
    carrito[idx].cantidad++;
  } else {
    carrito.push({ ...producto, cantidad: 1 });
  }

  guardarCarrito(carrito);
  actualizarContador();
  mostrarToast(`"${producto.nombre}" añadido al carrito`);
}

function cambiarCantidad(productoId, delta) {
  const carrito = obtenerCarrito();
  const idx = carrito.findIndex(p => p.id === productoId);
  if (idx < 0) return;

  carrito[idx].cantidad += delta;

  if (carrito[idx].cantidad <= 0) {
    carrito.splice(idx, 1);
  }

  guardarCarrito(carrito);
  actualizarContador();

  if (typeof renderizarCarrito === 'function') renderizarCarrito();
}

function eliminarDelCarrito(productoId) {
  let carrito = obtenerCarrito();
  carrito = carrito.filter(p => p.id !== productoId);
  guardarCarrito(carrito);
  actualizarContador();
  mostrarToast('Producto eliminado del carrito');
  if (typeof renderizarCarrito === 'function') renderizarCarrito();
}

/* ---------- CONTADOR (header) ---------- */
function actualizarContador() {
  const carrito = obtenerCarrito();
  const total = carrito.reduce((acc, p) => acc + p.cantidad, 0);

  const spans = document.querySelectorAll(
    '#contador-header, .number[id^="contador"], .content-shopping-cart .number'
  );
  spans.forEach(el => {
    el.textContent = `(${total})`;
  });
}

/* ---------- TOAST ---------- */
let toastTimer;
function mostrarToast(msg) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');
  if (!toast) return;

  clearTimeout(toastTimer);
  toastMsg.textContent = msg;
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

/* ---------- RENDER CARRITO (carrito.html) ---------- */
function renderizarCarrito() {
  const contenedor = document.getElementById('carrito-contenido');
  if (!contenedor) return;

  const carrito = obtenerCarrito();

  if (carrito.length === 0) {
    contenedor.innerHTML = `
      <div class="carrito-vacio">
        <i class="fa-solid fa-basket-shopping"></i>
        <h3>Tu carrito está vacío</h3>
        <p>Agrega productos desde nuestra tienda</p>
        <a href="index.html">Explorar Productos</a>
      </div>`;
    actualizarResumen(carrito);
    return;
  }

  contenedor.innerHTML = `
    <table class="carrito-tabla">
      <thead>
        <tr>
          <th>Producto</th>
          <th>Precio</th>
          <th>Cantidad</th>
          <th>Subtotal</th>
          <th></th>
        </tr>
      </thead>
      <tbody id="carrito-tbody">
        ${carrito.map(item => `
          <tr>
            <td>
              <div class="producto-info">
                <img src="${item.imagen}" alt="${item.nombre}" />
                <span class="producto-nombre">${item.nombre}</span>
              </div>
            </td>
            <td>
              <span class="precio-item">
                ${formatCOP(item.precio)}
                ${item.precioOriginal
                  ? `<span class="precio-tachado">${formatCOP(item.precioOriginal)}</span>`
                  : ''}
              </span>
            </td>
            <td>
              <div class="cantidad-control">
                <button onclick="cambiarCantidad('${item.id}', -1)">−</button>
                <span>${item.cantidad}</span>
                <button onclick="cambiarCantidad('${item.id}', 1)">+</button>
              </div>
            </td>
            <td><span class="precio-item">${formatCOP(item.precio * item.cantidad)}</span></td>
            <td>
              <button class="btn-eliminar" onclick="eliminarDelCarrito('${item.id}')" title="Eliminar">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </td>
          </tr>`).join('')}
      </tbody>
    </table>`;

  actualizarResumen(carrito);
}

/* ---------- RESUMEN ---------- */
function actualizarResumen(carrito) {
  let subtotal = 0;
  let descuento = 0;

  carrito.forEach(item => {
    subtotal += item.precio * item.cantidad;
    if (item.precioOriginal) {
      descuento += (item.precioOriginal - item.precio) * item.cantidad;
    }
  });

  const total = subtotal;

  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  set('resumen-subtotal', formatCOP(subtotal));
  set('resumen-descuento', `-${formatCOP(descuento)}`);
  set('resumen-total', formatCOP(total));
}

/* ---------- CUPÓN (demo) ---------- */
function aplicarCupon() {
  const input = document.getElementById('input-cupon');
  if (!input) return;
  const codigo = input.value.trim().toUpperCase();
  const codigos = { 'BARISTAS10': 0.10, 'CAFE15': 0.15 };

  if (codigos[codigo]) {
    mostrarToast(`Cupón aplicado: ${Math.round(codigos[codigo] * 100)}% de descuento`);
    input.value = '';
  } else {
    mostrarToast('Cupón no válido');
  }
}

/* ---------- MODAL PAGO ---------- */
function abrirModalPago() {
  const carrito = obtenerCarrito();
  if (carrito.length === 0) {
    mostrarToast('El carrito está vacío');
    return;
  }

  const subtotal = carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
  const cant = carrito.reduce((acc, p) => acc + p.cantidad, 0);

  document.getElementById('modal-cant').textContent = cant;
  document.getElementById('modal-total').textContent = formatCOP(subtotal);
  document.getElementById('modal-pago').classList.add('active');
}

function cerrarModal() {
  document.getElementById('modal-pago').classList.remove('active');
}

function confirmarPago() {
  cerrarModal();
  guardarCarrito([]);
  actualizarContador();
  mostrarToast('¡Pago confirmado! Gracias por tu compra 🎉');
  setTimeout(() => {
    if (typeof renderizarCarrito === 'function') renderizarCarrito();
  }, 500);
}

/* Cerrar modal al hacer click fuera */
document.addEventListener('click', (e) => {
  const modal = document.getElementById('modal-pago');
  if (modal && e.target === modal) cerrarModal();
});

/* ---------- BOTONES "Añadir al carrito" (index.html) ---------- */
function inicializarBotonesCarrito() {
  document.querySelectorAll('.add-cart').forEach((btn) => {
    const card = btn.closest('.card-product');
    if (!card) return;

    const img = card.querySelector('img');
    if (!img) return;

    const src = img.getAttribute('src') || '';
    const match = src.match(/img\/([^.]+)\./);
    const productoId = match ? match[1] : null;

    if (!productoId || !catalogo[productoId]) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      agregarAlCarrito(productoId);
    });
  });

  const btnHeader = document.getElementById('btn-carrito-header');
  if (btnHeader) {
    btnHeader.style.cursor = 'pointer';
    btnHeader.addEventListener('click', () => {
      window.location.href = 'carrito.html';
    });
  }

  document.querySelectorAll('.container-user').forEach(el => {
    el.addEventListener('click', () => {
      window.location.href = 'carrito.html';
    });
  });
}

/* ---------- INIT ---------- */
document.addEventListener('DOMContentLoaded', () => {
  actualizarContador();
  inicializarBotonesCarrito();

  if (document.getElementById('carrito-contenido')) {
    renderizarCarrito();
  }
});