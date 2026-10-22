(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const menuToggle = $('.menu-toggle');
  const nav = $('.main-nav');
  const cart = $('.cart-drawer');
  const cartCount = $('.cart-count');
  const cartItems = $('.cart-items');
  const toast = $('.toast');
  const basket = new Map();
  let toastTimer;

  $('#year').textContent = new Date().getFullYear();

  menuToggle.addEventListener('click', () => {
    const opened = nav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(opened));
    menuToggle.setAttribute('aria-label', opened ? 'Fechar menu' : 'Abrir menu');
  });
  $$('.nav-link').forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }));

  $$('.category-tab').forEach(tab => tab.addEventListener('click', () => {
    $$('.category-tab').forEach(item => item.classList.toggle('selected', item === tab));
    const filter = tab.dataset.filter;
    $$('.product-card').forEach(card => {
      card.hidden = filter !== 'todos' && card.dataset.category !== filter;
    });
  }));

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
  }

  function openCart() {
    document.body.classList.add('cart-open');
    cart.setAttribute('aria-hidden', 'false');
  }
  function closeCart() {
    document.body.classList.remove('cart-open');
    cart.setAttribute('aria-hidden', 'true');
  }
  $$('[data-open-cart]').forEach(button => button.addEventListener('click', openCart));
  $$('[data-close-cart]').forEach(button => button.addEventListener('click', event => {
    if (event.target.matches('[data-close-cart]') || event.currentTarget === button) closeCart();
  }));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeCart(); });

  $$('[data-add]').forEach(button => button.addEventListener('click', () => {
    const name = button.dataset.add;
    basket.set(name, (basket.get(name) || 0) + 1);
    renderCart();
    showToast(name + ' adicionado ao seu pedido');
  }));

  function renderCart() {
    const totalItems = [...basket.values()].reduce((sum, count) => sum + count, 0);
    cartCount.textContent = totalItems;
    if (!totalItems) {
      cartItems.innerHTML = '<div class="empty-cart"><span>✳</span><strong>Seu carrinho está esperando.</strong><p>Escolha algo gostoso no cardápio para começar.</p><button class="button button-dark" data-close-cart>Explorar cardápio</button></div>';
      cartItems.querySelector('[data-close-cart]').addEventListener('click', closeCart);
      $('.checkout-button').disabled = true;
      return;
    }
    cartItems.innerHTML = [...basket.entries()].map(([name, quantity]) => `
      <div class="cart-row">
        <div class="cart-row-copy"><strong>${name}</strong><small>Preço será definido com o cardápio final</small></div>
        <div class="quantity"><button type="button" data-minus="${name}" aria-label="Diminuir ${name}">−</button><span>${quantity}</span><button type="button" data-plus="${name}" aria-label="Aumentar ${name}">+</button></div>
      </div>`).join('');
    $$('[data-minus]', cartItems).forEach(button => button.addEventListener('click', () => {
      const name = button.dataset.minus;
      const next = (basket.get(name) || 0) - 1;
      if (next <= 0) basket.delete(name); else basket.set(name, next);
      renderCart();
    }));
    $$('[data-plus]', cartItems).forEach(button => button.addEventListener('click', () => {
      const name = button.dataset.plus;
      basket.set(name, (basket.get(name) || 0) + 1);
      renderCart();
    }));
    $('.checkout-button').disabled = false;
  }

  $('.checkout-button').addEventListener('click', () => {
    showToast('Na próxima etapa vamos configurar preços e pedidos pelo WhatsApp.');
  });

  // Avoid pretending the preview has live ordering, business hours or delivery details.
  $$('a[href^="#"]').forEach(link => link.addEventListener('click', event => {
    const target = $(link.getAttribute('href'));
    if (target) {
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', link.getAttribute('href'));
    }
  }));
})();