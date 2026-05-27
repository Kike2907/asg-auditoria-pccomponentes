/*
  ARCHIVO: app.js
  Script optimizado para PCComponentes
  - Sin librerías externas innecesarias
  - Manejo de cookies transparente
  - Lazy loading de imágenes 
  - Funcionalidad de carrito ligera
*/

'use strict';

// ============================================
// 1. GESTIÓN DE CONSENTIMIENTO DE COOKIES
// ============================================

class CookieConsent {
  constructor() {
    this.dialog = document.getElementById('cookie-consent');
    this.essentialCheckbox = document.getElementById('essential-cookies');
    this.analyticsCheckbox = document.getElementById('analytics-cookies');
    this.marketingCheckbox = document.getElementById('marketing-cookies');
    
    this.init();
  }

  init() {
    // Mostrar diálogo si no hay consentimiento guardado
    if (!this.hasConsentSaved()) {
      this.dialog.showModal();
    } else {
      // Cargar cookies autorizadas
      this.loadSavedConsent();
      this.loadAuthorizedScripts();
    }
  }

  hasConsentSaved() {
    return localStorage.getItem('cookie-consent') !== null;
  }

  loadSavedConsent() {
    const consent = JSON.parse(localStorage.getItem('cookie-consent'));
    if (consent) {
      this.analyticsCheckbox.checked = consent.analytics;
      this.marketingCheckbox.checked = consent.marketing;
    }
  }

  saveConsent() {
    const consent = {
      essential: true, // Siempre true
      analytics: this.analyticsCheckbox.checked,
      marketing: this.marketingCheckbox.checked,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('cookie-consent', JSON.stringify(consent));
    this.dialog.close();
    this.loadAuthorizedScripts();
  }

  rejectAll() {
    this.analyticsCheckbox.checked = false;
    this.marketingCheckbox.checked = false;
    this.saveConsent();
  }

  acceptAll() {
    this.analyticsCheckbox.checked = true;
    this.marketingCheckbox.checked = true;
    this.saveConsent();
  }

  loadAuthorizedScripts() {
    const consent = JSON.parse(localStorage.getItem('cookie-consent'));
    
    if (consent.analytics) {
      this.loadGoogleAnalytics();
    }
    
    if (consent.marketing) {
      this.loadMarketingScripts();
    }
  }

  loadGoogleAnalytics() {
    // Google Analytics ya está en el HTML con async
    // Pero podemos añadir eventos custom aquí
    if (window.gtag) {
      gtag('consent', 'update', {
        'analytics_storage': 'granted'
      });
    }
  }

  loadMarketingScripts() {
    // Scripts de marketing (Criteo, etc.)
    console.log('Marketing scripts loaded');
  }
}

// ============================================
// 2. LAZY LOADING DE IMÁGENES
// ============================================

class LazyImageLoader {
  constructor() {
    this.images = document.querySelectorAll('img[loading="lazy"]');
    this.init();
  }

  init() {
    // Usar IntersectionObserver si está disponible
    if ('IntersectionObserver' in window) {
      this.observeImages();
    } else {
      // Fallback: cargar todas las imágenes
      this.loadAllImages();
    }
  }

  observeImages() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          this.loadImage(img);
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px' // Cargar 50px antes de llegar al viewport
    });

    this.images.forEach(img => observer.observe(img));
  }

  loadImage(img) {
    // Si tiene data-src, usar ese. Si no, cargar desde src
    if (img.dataset.src) {
      img.src = img.dataset.src;
    }
    
    // picture ya tiene las imágenes en source, no necesita hacer nada
    img.classList.add('loaded');
  }

  loadAllImages() {
    this.images.forEach(img => this.loadImage(img));
  }
}

// ============================================
// 3. CARRITO DE COMPRAS (LIGERO)
// ============================================

class ShoppingCart {
  constructor() {
    this.cart = this.loadCart();
    this.updateCartLink();
  }

  loadCart() {
    const saved = localStorage.getItem('shopping-cart');
    return saved ? JSON.parse(saved) : [];
  }

  saveCart() {
    localStorage.setItem('shopping-cart', JSON.stringify(this.cart));
    this.updateCartLink();
  }

  addItem(id, name, price, quantity = 1) {
    const existingItem = this.cart.find(item => item.id === id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.cart.push({
        id,
        name,
        price,
        quantity
      });
    }

    this.saveCart();
    this.showNotification(`${name} añadido al carrito`);
  }

  updateCartLink() {
    const cartLink = document.querySelector('.cart-link');
    const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    
    if (cartLink) {
      cartLink.setAttribute('aria-label', 
        `Carrito de compras (${totalItems} artículo${totalItems !== 1 ? 's' : ''})`
      );
      
      // Actualizar texto
      cartLink.textContent = `🛒 Carrito (${totalItems})`;
    }
  }

  showNotification(message) {
    // Crear notificación accesible
    const notification = document.createElement('div');
    notification.setAttribute('role', 'status');
    notification.setAttribute('aria-live', 'polite');
    notification.setAttribute('aria-atomic', 'true');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background-color: #04A86C;
      color: white;
      padding: 16px 24px;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      z-index: 1001;
      animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // Remover después de 3 segundos
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
}

// ============================================
// 4. BÚSQUEDA Y FILTRADO
// ============================================

class ProductSearch {
  constructor() {
    this.searchInput = document.getElementById('search-input');
    this.productGrid = document.querySelector('.product-grid');
    
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => this.search(e));
    }
  }

  search(event) {
    const query = event.target.value.toLowerCase().trim();
    const items = this.productGrid.querySelectorAll('.product-card');
    
    items.forEach(item => {
      const title = item.querySelector('h3').textContent.toLowerCase();
      const description = item.querySelector('.description').textContent.toLowerCase();
      
      if (title.includes(query) || description.includes(query) || query === '') {
        item.style.display = '';
      } else {
        item.style.display = 'none';
      }
    });
  }
}

// ============================================
// 5. MODO ECO (REDUCCIÓN DE DATOS)
// ============================================

class EcoMode {
  constructor() {
    this.isEcoMode = this.checkEcoMode();
    this.applyEcoMode();
  }

  checkEcoMode() {
    // Detectar si el navegador tiene preferencia por bajo data
    if (window.matchMedia) {
      return window.matchMedia('(prefers-reduced-data: reduce)').matches;
    }
    return false;
  }

  applyEcoMode() {
    if (this.isEcoMode) {
      document.documentElement.classList.add('eco-mode');
      
      // Desactivar autoplay de vídeos (si los hay)
      const videos = document.querySelectorAll('video');
      videos.forEach(video => {
        video.autoplay = false;
      });
      
      // Desactivar animaciones
      document.documentElement.style.setProperty('--transition-fast', '0ms');
      document.documentElement.style.setProperty('--transition-normal', '0ms');
      
      console.log('Eco mode activated - Data usage reduced');
    }
  }
}

// ============================================
// 6. FUNCIONES GLOBALES
// ============================================

// Función global para añadir al carrito desde HTML
window.addToCart = function(id, name, price) {
  cart.addItem(id, name, price);
};

// Función global para aceptar todas las cookies
window.acceptAllCookies = function() {
  cookieConsent.acceptAll();
};

// Función global para rechazar todas las cookies
window.rejectAllCookies = function() {
  cookieConsent.rejectAll();
};

// Función global para guardar preferencias
window.saveCookiePreferences = function() {
  cookieConsent.saveConsent();
};

// ============================================
// 7. INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  // Inicializar módulos
  const cookieConsent = new CookieConsent();
  window.cookieConsent = cookieConsent;
  
  const lazyLoader = new LazyImageLoader();
  const cart = new ShoppingCart();
  window.cart = cart;
  
  const search = new ProductSearch();
  const ecoMode = new EcoMode();

  console.log('✅ PCComponentes app initialized');
});

// ============================================
// 8. OPTIMIZACIÓN DE RENDIMIENTO
// ============================================

// Detectar conexión lenta y adaptar
if ('connection' in navigator) {
  const connection = navigator.connection;
  
  if (connection.effectiveType === '4g') {
    console.log('Good connection - puede cargar contenido premium');
  } else if (connection.effectiveType === '3g') {
    console.log('Moderate connection - aplicar optimizaciones');
  } else {
    console.log('Slow connection - aplicar eco mode');
    document.documentElement.classList.add('eco-mode');
  }

  // Escuchar cambios de conexión
  connection.addEventListener('change', () => {
    console.log('Connection changed:', connection.effectiveType);
  });
}

// ============================================
// 9. MONITOREO DE RENDIMIENTO
// ============================================

// Medir Core Web Vitals de forma responsable
if ('web-vital' in window || window.PerformanceObserver) {
  // LCP - Largest Contentful Paint
  if (PerformanceObserver) {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('LCP:', lastEntry.renderTime || lastEntry.loadTime);
      });
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {
      console.log('LCP measurement not supported');
    }
  }
}
