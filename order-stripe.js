// Stripe Order Script - Live Mode
const stripe = Stripe("pk_live_51Ric5sAyeIzuGSz82jAzY5GAGschIxgwdRuf5vWHpL5sLYv3c5jIlTIOgpjNgkNMIAf40eSJKATw7J2MfknvqD6G00shdDdHnZ"); // <-- Replace with your actual live publishable key
const form = document.querySelector("form");

if(form){
  form.addEventListener("submit", function(e){
    // Allow form email to submit first
    setTimeout(async () => {
      try {
        // Example: dynamic amount based on dropdown
        let amount = 1000; // default $10
        const sizeElement = document.getElementById('size');
        if(sizeElement && sizeElement.value){
          const priceMap = { small: 1000, medium: 2000, large: 3000 };
          amount = priceMap[sizeElement.value.toLowerCase()] || 1000;
        }

        // Create PaymentIntent via Netlify Function
        const response = await fetch('/.netlify/functions/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount })
        });

        const { clientSecret, error } = await response.json();
        if(error){
          alert("Payment error: " + error);
          return;
        }

        // Confirm Card Payment using the actual card details entered by the user
        const result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: {
              // Use the default card input on the form
              number: document.querySelector('input[name="cardnumber"]').value,
              exp_month: document.querySelector('input[name="expmonth"]').value,
              exp_year: document.querySelector('input[name="expyear"]').value,
              cvc: document.querySelector('input[name="cvc"]').value,
            }
          }
        });

        if(result.error){
          alert("Payment failed: " + result.error.message);
        } else if(result.paymentIntent && result.paymentIntent.status === "succeeded"){
          alert("Payment successful! Thank you for your order.");
        }
        
      } catch(err){
        alert("Payment error: " + err.message);
      }
    }, 500);
  });
}
