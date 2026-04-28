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
            var currentMainIndex = 0;

            // Build layout containers
            var thumbsCol = document.createElement('div');
            thumbsCol.className = 'galeria-thumbs';

            var mainWrap = document.createElement('div');
            mainWrap.className = 'galeria-main-wrap';

            // Main image element
            var mainImg = document.createElement('img');
            mainImg.className = 'galeria-main-img';
            mainImg.alt = 'Plano y medidas - ' + producto.nombre;
            if (producto.imagenes.length > 0) {
                mainImg.src = producto.imagenes[0];
            }

            // Magnifier icon (top-right corner, indicates click-to-zoom)
            var zoomIcon = document.createElement('div');
            zoomIcon.className = 'galeria-zoom-icon';
            zoomIcon.setAttribute('aria-hidden', 'true');
            zoomIcon.innerHTML =
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" ' +
                'stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" ' +
                'width="16" height="16">' +
                '<circle cx="11" cy="11" r="8"/>' +
                '<line x1="21" y1="21" x2="16.65" y2="16.65"/>' +
                '<line x1="11" y1="8"  x2="11"    y2="14"/>' +
                '<line x1="8"  y1="11" x2="14"    y2="11"/>' +
                '</svg>';

            mainWrap.appendChild(mainImg);
            mainWrap.appendChild(zoomIcon);

            // Click on main image → open lightbox at currently shown image
            mainWrap.addEventListener('click', function () {
                openLightbox(currentMainIndex);
            });

            // Helper: fade-transition to a new main image
            function changeMainImage(src, idx) {
                currentMainIndex = idx;
                mainImg.style.opacity = '0';
                setTimeout(function () {
                    mainImg.src = src;
                    mainImg.style.opacity = '1';
                }, 180);
            }

            // Build thumbnails
            producto.imagenes.forEach(function (imgSrc, idx) {
                var thumb = document.createElement('div');
                thumb.className = 'galeria-thumb' + (idx === 0 ? ' active' : '');
                thumb.setAttribute('tabindex', '0');
                thumb.setAttribute('role', 'button');
                thumb.setAttribute('aria-label', 'Seleccionar imagen ' + (idx + 1));

                var thumbImg = document.createElement('img');
                thumbImg.src = imgSrc;
                thumbImg.alt = 'Miniatura ' + (idx + 1) + ' - ' + producto.nombre;
                thumbImg.className = 'galeria-thumb-img';

                thumb.appendChild(thumbImg);
                thumbsCol.appendChild(thumb);

                // Register in lightbox images array
                lbImages.push({ src: imgSrc, alt: 'Plano y medidas - ' + producto.nombre });

                // Hover → preview main image (active border stays on last clicked)
                thumb.addEventListener('mouseenter', (function (s, i) {
                    return function () { changeMainImage(s, i); };
                }(imgSrc, idx)));

                // Click → select as active + change main image
                thumb.addEventListener('click', (function (s, i, t) {
                    return function () {
                        changeMainImage(s, i);
                        thumbsCol.querySelectorAll('.galeria-thumb').forEach(function (el) {
                            el.classList.remove('active');
                        });
                        t.classList.add('active');
                    };
                }(imgSrc, idx, thumb)));

                // Keyboard: Enter / Space → select
                thumb.addEventListener('keydown', (function (s, i, t) {
                    return function (e) {
                        if (e.key === ' ') { e.preventDefault(); }
                        if (e.key === 'Enter' || e.key === ' ') {
                            changeMainImage(s, i);
                            thumbsCol.querySelectorAll('.galeria-thumb').forEach(function (el) {
                                el.classList.remove('active');
                            });
                            t.classList.add('active');
                        }
                    };
                }(imgSrc, idx, thumb)));
            });

            galeria.appendChild(thumbsCol);
            galeria.appendChild(mainWrap);

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
