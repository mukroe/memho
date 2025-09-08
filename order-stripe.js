// order-stripe.js — Unified Stripe Elements checkout + Meta Pixel tracking
// All logic moved here so order.html requires no edits beyond loading this file.

(function () {
  const STRIPE_PK = 'pk_live_51Ric5sAyeIzuGSz82jAzY5GAGschIxgwdRuf5vWHpL5sLYv3c5jIlTIOgpjNgkNMIAf40eSJKATw7J2MfknvqD6G00shdDdHnZ';

  // Map portrait sizes to prices in cents
  const PRICE_MAP = {
    "Premium Gift Package": 44000,
    "18×24": 39000,
    "12×18": 29000,
    "8×10": 19000
  };

  // Guard against multiple loads
  if (window.__MEMHO_STRIPE_ATTACHED__) return;
  window.__MEMHO_STRIPE_ATTACHED__ = true;

  // Initialize Stripe Elements
  const stripe = Stripe(STRIPE_PK);
  const elements = stripe.elements();
  const card = elements.create('card');

  // Safe query helpers
  const form = document.getElementById('payment-form');
  const cardContainer = document.getElementById('card-element');
  const cardErrors = document.getElementById('card-errors');

  if (!form || !cardContainer) {
    console.warn('[MemHo] Stripe: missing #payment-form or #card-element');
    return;
  }

  card.mount('#card-element');

  card.on('change', function (event) {
    if (cardErrors) {
      cardErrors.textContent = event.error ? event.error.message : '';
    }
  });

  // Meta Pixel helper
  function trackFb(event, payload) {
    try {
      if (typeof fbq === 'function') fbq('track', event, payload || {});
    } catch (_) {
      // never block checkout
    }
  }

  // Handle form submission
  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const sizeEl = document.getElementById('size');
    const size = sizeEl ? sizeEl.value : null;
    const amount = size ? PRICE_MAP[size] : null;

    if (!amount) {
      alert('Please choose a portrait size.');
      return;
    }

    // Track start of checkout
    trackFb('InitiateCheckout', {
      value: amount / 100,
      currency: 'USD',
      contents: [{ id: size, quantity: 1 }],
      content_type: 'product'
    });

    try {
      // Create PaymentIntent via Netlify function
      const resp = await fetch('/.netlify/functions/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });

      const data = await resp.json();
      const clientSecret = data.clientSecret || data.client_secret;
      if (!clientSecret) {
        alert('Payment error: Missing client secret.');
        return;
      }

      // Confirm card payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card }
      });

      if (result.error) {
        if (cardErrors) cardErrors.textContent = result.error.message || '';
        alert('Payment failed: ' + (result.error.message || 'Unknown error'));
        return;
      }

      if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        // Track purchase before redirect
        trackFb('Purchase', {
          value: amount / 100,
          currency: 'USD',
          contents: [{ id: size, quantity: 1 }],
          content_type: 'product'
        });

        alert('Payment successful! Your order has been submitted.');
        e.target.submit(); // proceed with FormSubmit email
      } else {
        alert('Payment did not complete. Please try again.');
      }
    } catch (err) {
      alert('Payment error: ' + (err && err.message ? err.message : String(err)));
    }
  });

  // Optional: debug log on size change
  const sizeSelect = document.getElementById('size');
  if (sizeSelect) {
    sizeSelect.addEventListener('change', function () {
      const sel = this.value;
      if (PRICE_MAP[sel]) {
        console.log('[MemHo] Selected:', sel, 'Price:', PRICE_MAP[sel] / 100);
      }
    });
  }
})();

