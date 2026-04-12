/* ===== WHATSAPP CHAT WIDGET — whatsapp-chat.js =====
   Instrucciones:
   1. Cambia el número de teléfono en WA_CONFIG.phone (con código de país, sin + ni espacios)
   2. Cambia WA_CONFIG.nombre con el nombre que quieras mostrar
   3. Cambia WA_CONFIG.mensaje con el texto que llegará pre-escrito en WhatsApp
   4. Agrega estas dos líneas antes del </body> de CADA página:
         <link rel="stylesheet" href="whatsapp-chat.css" />
         <script src="whatsapp-chat.js"></script>
   ===================================================== */

(function () {

	/* ──── CONFIGURACIÓN ──── */
	const WA_CONFIG = {
		phone:   '573214407131',                          // Tu número con código de país (Colombia = 57)
		nombre:  'Altiva Cafe ☕',                           // Nombre que aparece en el chat
		cargo:   'Atención al cliente',                   // Subtítulo del header
		mensaje: '¡Hola! Quiero hacer un pedido \uf0f4',     // Texto pre-escrito en WhatsApp
		saludo: [                                          // Mensajes del "bot" (puedes añadir más)
			'¡Hola! 👋 Bienvenido a *Altiva Cafe*.',
			'Estamos aquí para ayudarte con tu pedido. ¿En qué podemos servirte hoy?'
		],
		demora: 800,   // ms antes de mostrar el segundo mensaje (simula que están escribiendo)
	};
	/* ─────────────────────── */

	const WA_SVG = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
		<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15
		-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475
		-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52
		.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207
		-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372
		-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2
		5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085
		1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
		<path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.533 5.857L.054 23.447
		a.75.75 0 0 0 .922.928l5.699-1.49A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373
		12-12S18.627 0 12 0zm0 22c-1.893 0-3.673-.513-5.204-1.41l-.36-.214-3.735.977
		.997-3.645-.234-.373A9.956 9.956 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10
		10-4.477 10-10 10z"/>
	</svg>`;

	function ahora() {
		return new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
	}

	function hoy() {
		return new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
	}

	function construir() {
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = document.currentScript
			? document.currentScript.src.replace('.js', '.css')
			: 'whatsapp-chat.css';
		document.head.appendChild(link);

		const wrap = document.createElement('div');
		wrap.className = 'wa-btn';
		wrap.id = 'wa-widget';
		wrap.innerHTML = `
			<div class="wa-chat" id="wa-chat">
				<div class="wa-header">
					<div class="wa-avatar">${WA_SVG}</div>
					<div class="wa-header-info">
						<div class="wa-header-name">${WA_CONFIG.nombre}</div>
						<div class="wa-header-status">
							<span class="wa-status-dot"></span> En línea
						</div>
					</div>
					<button class="wa-close" id="wa-close" aria-label="Cerrar chat">&#10005;</button>
				</div>
				<div class="wa-body" id="wa-body">
					<div class="wa-date-badge">${hoy()}</div>
				</div>
				<div class="wa-footer">
					<a class="wa-cta" id="wa-cta" href="#" target="_blank" rel="noopener">
						${WA_SVG}
						Abrir en WhatsApp
					</a>
					<p class="wa-disclaimer">Respuesta en minutos &middot; Sin costo</p>
				</div>
			</div>

			<button class="wa-trigger" id="wa-trigger" aria-label="Abrir chat de WhatsApp">
				${WA_SVG}
				<span class="wa-badge" id="wa-badge">1</span>
				<span class="wa-tooltip">¿Necesitas ayuda?</span>
			</button>
		`;
		document.body.appendChild(wrap);

		const widget  = document.getElementById('wa-widget');
		const trigger = document.getElementById('wa-trigger');
		const chat    = document.getElementById('wa-chat');
		const body    = document.getElementById('wa-body');
		const badge   = document.getElementById('wa-badge');
		const cta     = document.getElementById('wa-cta');
		const closeBtn= document.getElementById('wa-close');

		/* URL de WhatsApp */
		const waURL = `https://wa.me/${WA_CONFIG.phone}?text=${encodeURIComponent(WA_CONFIG.mensaje)}`;
		cta.href = waURL;

		/* Mensajes con efecto typing */
		function agregarBurbuja(texto) {
			const b = document.createElement('div');
			b.className = 'wa-bubble';
			b.innerHTML = `
				<div class="wa-bubble-sender">${WA_CONFIG.nombre}</div>
				<div class="wa-bubble-text">${texto.replace(/\*(.*?)\*/g, '<strong>$1</strong>')}</div>
				<div class="wa-bubble-time">${ahora()}</div>
			`;
			body.appendChild(b);
			body.scrollTop = body.scrollHeight;
		}

		function mostrarTyping() {
			const t = document.createElement('div');
			t.className = 'wa-typing';
			t.id = 'wa-typing';
			t.innerHTML = '<span></span><span></span><span></span>';
			body.appendChild(t);
			body.scrollTop = body.scrollHeight;
		}

		function quitarTyping() {
			const t = document.getElementById('wa-typing');
			if (t) t.remove();
		}

		let mensajesMostrados = false;

		function mostrarMensajes() {
			if (mensajesMostrados) return;
			mensajesMostrados = true;

			/* Primer mensaje inmediato */
			agregarBurbuja(WA_CONFIG.saludo[0]);

			/* Mensajes siguientes con efecto typing */
			let delay = 600;
			for (let i = 1; i < WA_CONFIG.saludo.length; i++) {
				const texto = WA_CONFIG.saludo[i];
				setTimeout(() => mostrarTyping(), delay);
				delay += WA_CONFIG.demora;
				setTimeout(() => { quitarTyping(); agregarBurbuja(texto); }, delay);
				delay += 300;
			}
		}

		/* Abrir / cerrar */
		trigger.addEventListener('click', () => {
			const abierto = widget.classList.toggle('open');
			if (abierto) {
				if (badge) badge.remove();
				mostrarMensajes();
			}
		});

		closeBtn.addEventListener('click', (e) => {
			e.stopPropagation();
			widget.classList.remove('open');
		});

		/* Cerrar al hacer clic fuera */
		document.addEventListener('click', (e) => {
			if (!widget.contains(e.target)) {
				widget.classList.remove('open');
			}
		});
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', construir);
	} else {
		construir();
	}

})();
