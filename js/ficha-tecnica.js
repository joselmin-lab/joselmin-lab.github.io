// ============================================================
// ficha-tecnica.js — Lógica de página + Lightbox
// AMS Shocks
// ============================================================

(function () {
    'use strict';

    // ── Lightbox state ─────────────────────────────────────────
    var lbImages  = [];
    var lbIndex   = 0;
    var lbOpen    = false;

    var lightbox  = document.getElementById('lightbox');
    var lbImg     = document.getElementById('lb-img');
    var lbCounter = document.getElementById('lb-counter');
    var lbClose   = document.getElementById('lb-close');
    var lbPrev    = document.getElementById('lb-prev');
    var lbNext    = document.getElementById('lb-next');

    function openLightbox(index) {
        lbIndex = index;
        lbImg.src = lbImages[lbIndex].src;
        lbImg.alt = lbImages[lbIndex].alt;
        updateCounter();
        lightbox.classList.add('is-open');
        document.body.style.overflow = 'hidden';
        lbOpen = true;
        lbClose.focus();
    }

    function closeLightbox() {
        lightbox.classList.remove('is-open');
        document.body.style.overflow = '';
        lbOpen = false;
    }

    function prevImage() {
        lbIndex = (lbIndex - 1 + lbImages.length) % lbImages.length;
        lbImg.src = lbImages[lbIndex].src;
        lbImg.alt = lbImages[lbIndex].alt;
        updateCounter();
    }

    function nextImage() {
        lbIndex = (lbIndex + 1) % lbImages.length;
        lbImg.src = lbImages[lbIndex].src;
        lbImg.alt = lbImages[lbIndex].alt;
        updateCounter();
    }

    function updateCounter() {
        lbCounter.textContent = (lbIndex + 1) + ' / ' + lbImages.length;
    }

    // Button listeners
    lbClose.addEventListener('click', closeLightbox);
    lbPrev.addEventListener('click', prevImage);
    lbNext.addEventListener('click', nextImage);

    // Click on backdrop (outside image) → close
    lightbox.addEventListener('click', function (e) {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', function (e) {
        if (!lbOpen) return;
        if (e.key === 'Escape')     { closeLightbox(); }
        if (e.key === 'ArrowLeft')  { prevImage(); }
        if (e.key === 'ArrowRight') { nextImage(); }
    });

    // ── Page / product logic ────────────────────────────────────
    document.addEventListener('DOMContentLoaded', function () {

        var urlParams  = new URLSearchParams(window.location.search);
        var productoId = urlParams.get('id');
        var producto   = (typeof productosDB !== 'undefined') ? productosDB[productoId] : null;

        if (producto) {
            document.getElementById('titulo-producto').textContent    = producto.nombre;
            document.getElementById('categoria-producto').textContent = producto.categoria;

            // ── Galería ─────────────────────────────────────────
            var galeria = document.getElementById('galeria-producto');

            producto.imagenes.forEach(function (imgSrc, idx) {
                // Outer clickable wrapper
                var wrapper = document.createElement('div');
                wrapper.className = 'galeria-thumb';
                wrapper.setAttribute('tabindex', '0');
                wrapper.setAttribute('role', 'button');
                wrapper.setAttribute('aria-label', 'Ver imagen ' + (idx + 1) + ' en pantalla completa');

                // Watermark
                var watermark = document.createElement('img');
                watermark.src       = 'img/logo.png';
                watermark.className = 'galeria-watermark';
                watermark.alt       = '';
                watermark.setAttribute('aria-hidden', 'true');

                // Product image
                var img = document.createElement('img');
                img.src       = imgSrc;
                img.alt       = 'Plano y medidas - ' + producto.nombre;
                img.className = 'galeria-img';

                // Magnifier overlay (SVG inline — no external dependency)
                var overlay = document.createElement('div');
                overlay.className = 'galeria-overlay';
                overlay.setAttribute('aria-hidden', 'true');
                overlay.innerHTML =
                    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" ' +
                    'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                    '<circle cx="11" cy="11" r="8"/>' +
                    '<line x1="21" y1="21" x2="16.65" y2="16.65"/>' +
                    '<line x1="11" y1="8"  x2="11"    y2="14"/>' +
                    '<line x1="8"  y1="11" x2="14"    y2="11"/>' +
                    '</svg>';

                wrapper.appendChild(watermark);
                wrapper.appendChild(img);
                wrapper.appendChild(overlay);
                galeria.appendChild(wrapper);

                // Register in lightbox images array
                lbImages.push({ src: imgSrc, alt: img.alt });

                // Click → open lightbox
                wrapper.addEventListener('click', (function (i) {
                    return function () { openLightbox(i); };
                }(idx)));

                // Enter / Space → open lightbox (keyboard accessibility)
                wrapper.addEventListener('keydown', (function (i) {
                    return function (e) {
                        // Always prevent Space from scrolling the page on focusable wrappers
                        if (e.key === ' ') { e.preventDefault(); }
                        if (e.key === 'Enter' || e.key === ' ') {
                            openLightbox(i);
                        }
                    };
                }(idx)));
            });

            // ── Especificaciones ──────────────────────────────
            var lista = document.getElementById('lista-especificaciones');
            producto.especificaciones.forEach(function (espec) {
                var li = document.createElement('li');
                li.textContent = espec;
                lista.appendChild(li);
            });

        } else {
            // Product not found — hide product sections, show error message
            var toHide = ['contenido-ficha', 'sellos-section', 'galeria-section', 'specs-section'];
            toHide.forEach(function (id) {
                var el = document.getElementById(id);
                if (el) el.style.display = 'none';
            });
            // Hide CTA section (it has no id, select by class)
            var cta = document.querySelector('.cta-section');
            if (cta) cta.style.display = 'none';
            // Also hide the hero wrapper
            var hero = document.querySelector('.producto-hero');
            if (hero) hero.style.display = 'none';
            document.getElementById('error-mensaje').style.display = 'block';
        }
    });

}());
