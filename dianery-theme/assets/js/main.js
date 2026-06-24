document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.querySelector('.js-menu-toggle');
  const primaryNav = document.querySelector('.js-primary-nav');

  if (menuToggle && primaryNav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = primaryNav.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  document.querySelectorAll('.product-card').forEach((card) => {
    const variantButtons = card.querySelectorAll('.variant-btn');
    if (!variantButtons.length) return;

    const priceDisplay = card.querySelector('.js-product-price-display');
    const productImg = card.querySelector('.js-product-img');
    const whatsappBtn = card.querySelector('.js-whatsapp-btn');
    if (!whatsappBtn) return;

    const phone = whatsappBtn.dataset.phone || '';
    const baseText = whatsappBtn.dataset.baseText || '';

    variantButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        variantButtons.forEach((button) => {
          button.classList.remove('is-active');
          button.setAttribute('aria-pressed', 'false');
        });

        btn.classList.add('is-active');
        btn.setAttribute('aria-pressed', 'true');

        const variantName = btn.dataset.name || '';
        const newPrice = Number(btn.dataset.price || 0);
        const newImg = btn.dataset.img || '';

        if (priceDisplay && newPrice) {
          priceDisplay.textContent = newPrice.toLocaleString('es-CO');
        }

        if (productImg && newImg) {
          productImg.src = newImg;
        }

        const formattedPrice = newPrice ? newPrice.toLocaleString('es-CO') : '';
        const updatedText = `${baseText} - Variación: ${variantName}${formattedPrice ? ` - Valor: $${formattedPrice} COP` : ''}.`;
        whatsappBtn.href = `https://wa.me/${phone}?text=${encodeURIComponent(updatedText)}`;
      });
    });
  });

  document.querySelectorAll('.js-video').forEach((video) => {
    const button = video.querySelector('.video-card__button');
    const videoId = video.dataset.videoId;
    if (!button || !videoId) return;

    button.addEventListener('click', () => {
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`;
      iframe.title = 'Video destacado';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.allowFullscreen = true;
      iframe.loading = 'lazy';
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = '0';
      video.innerHTML = '';
      video.appendChild(iframe);
    });
  });
});
