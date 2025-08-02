// Stripe Option A isolated script
const stripe = Stripe("YOUR_PUBLISHABLE_KEY"); // Replace with real publishable key
const form = document.querySelector("form");

if(form){
  form.addEventListener("submit", function(e){
    // Allow form to submit normally (email is sent)
    setTimeout(async () => {
      try {
        // Example: dynamic amount from a dropdown if exists
        let amount = 1000; // default $10
        const sizeElement = document.getElementById('size');
        if(sizeElement && sizeElement.value){
            const priceMap = {small: 1000, medium: 2000, large: 3000};
            amount = priceMap[sizeElement.value.toLowerCase()] || 1000;
        }

        // Request PaymentIntent from Netlify function
        const response = await fetch('/.netlify/functions/create-payment-intent', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ amount })
        });

        const { clientSecret, error } = await response.json();
        if(error){
          alert("Payment error: " + error);
          return;
        }

        // Confirm payment using Stripe test token (replace with Elements for real cards)
        const result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: { card: { token: "tok_visa" } }
        });

        if(result.error){
          alert("Payment failed: " + result.error.message);
        } else if(result.paymentIntent && result.paymentIntent.status === "succeeded"){
          alert("Payment successful! Thank you for your order.");
        }
      } catch(err){
        alert("Payment error: " + err.message);
      }
    }, 500); // half-second delay ensures email submits first
  });
}
