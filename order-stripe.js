// Stripe Order Script - Live Mode
const stripe = Stripe("pk_live_51Ric5sAyeIzuGSz82jAzY5GAGschIxgwdRuf5vWHpL5sLYv3c5jIlTIOgpjNgkNMIAf40eSJKATw7J2MfknvqD6G00shdDdHnZ"); // <-- Replace with your actual live publishable key
const form = document.querySelector("form");

if (form) {
  form.addEventListener("submit", function(e) {
    // Allow form to submit (emails you first)
    setTimeout(async () => {
      try {
        let amount = 1000; // Default $10
        const sizeElement = document.getElementById('size');
        if (sizeElement && sizeElement.value) {
          const priceMap = { small: 1000, medium: 2000, large: 3000 };
          amount = priceMap[sizeElement.value.toLowerCase()] || 1000;
        }

        const response = await fetch('/.netlify/functions/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount })
        });

        const { clientSecret, error } = await response.json();
        if (error) {
          alert("Payment error: " + error);
          return;
        }

        const result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: {
              number: document.querySelector('input[name="cardnumber"]').value,
              exp_month: document.querySelector('input[name="exp-month"]').value,
              exp_year: document.querySelector('input[name="exp-year"]').value,
              cvc: document.querySelector('input[name="cvc"]').value
            }
          }
        });

        if (result.error) {
          alert("Payment failed: " + result.error.message);
        } else if (result.paymentIntent && result.paymentIntent.status === "succeeded") {
          alert("Payment successful! Thank you for your order.");
        }
      } catch (err) {
        alert("Payment error: " + err.message);
      }
    }, 500); // Ensures your email form submits first
  });
}
