// --- Animated Add to Cart Effect, Keyboard Shortcuts, Price Animation, Responsive Cart ---

document.addEventListener('DOMContentLoaded', function() {
  // Add to Cart Animation
  const menuItemsList = document.getElementById('menu-items-list');
  const selectedTable = document.getElementById('selected-items-table');
  const selectedTbody = selectedTable.querySelector('tbody');
  const cartSummary = document.getElementById('floating-cart-summary');

  function flyToCart(badge, target) {
    const badgeRect = badge.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const clone = badge.cloneNode(true);
    document.body.appendChild(clone);
    clone.classList.add('fly-badge');
    clone.style.left = badgeRect.left + 'px';
    clone.style.top = badgeRect.top + 'px';
    clone.style.width = badgeRect.width + 'px';
    clone.style.height = badgeRect.height + 'px';
    setTimeout(() => {
      clone.style.transform = `translate(${targetRect.left-badgeRect.left}px,${targetRect.top-badgeRect.top}px) scale(0.7)`;
      clone.style.opacity = 0.7;
    }, 10);
    setTimeout(() => {
      clone.remove();
    }, 600);
  }

  // Listen for add-to-cart clicks
  menuItemsList.addEventListener('click', function(e) {
    const card = e.target.closest('.menu-item-card');
    if (!card) return;
    if (e.target.classList.contains('menu-add-btn') || e.target.closest('.menu-add-btn')) {
      const badge = card.querySelector('.menu-item-qty');
      if (badge && badge.offsetParent !== null) {
        const cartTarget = document.querySelector('#floating-cart-summary .cart-badge') || selectedTable;
        flyToCart(badge, cartTarget);
      }
    }
  });

  // Animate price changes
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(m => {
      if (m.type === 'childList' && m.target.classList.contains('price-animate')) {
        m.target.classList.remove('price-animate');
        void m.target.offsetWidth;
        m.target.classList.add('price-animate');
      }
    });
  });
  selectedTbody.addEventListener('DOMSubtreeModified', function(e) {
    selectedTbody.querySelectorAll('td:nth-child(4)').forEach(td => {
      td.classList.add('price-animate');
      observer.observe(td, { childList: true });
    });
  });

  // Keyboard shortcuts: Enter to add, Arrow keys to navigate
  let lastFocusedCard = null;
  menuItemsList.addEventListener('focusin', function(e) {
    lastFocusedCard = e.target.closest('.menu-item-card');
  });
  document.addEventListener('keydown', function(e) {
    if (!lastFocusedCard) return;
    if (e.key === 'Enter') {
      lastFocusedCard.querySelector('.menu-add-btn').click();
      e.preventDefault();
    } else if (e.key === 'ArrowRight') {
      const next = lastFocusedCard.nextElementSibling;
      if (next) next.focus();
      e.preventDefault();
    } else if (e.key === 'ArrowLeft') {
      const prev = lastFocusedCard.previousElementSibling;
      if (prev) prev.focus();
      e.preventDefault();
    }
  });
  // Make menu cards focusable
  document.querySelectorAll('.menu-item-card').forEach(card => {
    card.setAttribute('tabindex', '0');
  });

  // Responsive floating cart summary
  function updateCartSummary() {
    let totalQty = 0, totalPrice = 0;
    window.selectedItems?.forEach(item => {
      totalQty += item.quantity;
      totalPrice += item.price * item.quantity;
    });
    const badge = cartSummary.querySelector('.cart-badge');
    badge.textContent = totalQty;
    cartSummary.querySelector('.cart-total').textContent = '₹' + totalPrice;
    cartSummary.style.display = totalQty > 0 ? 'flex' : 'none';
  }
  window.renderSelectedItems = (function(orig) {
    return function() {
      orig.apply(this, arguments);
      updateCartSummary();
    }
  })(window.renderSelectedItems);
  updateCartSummary();
});
