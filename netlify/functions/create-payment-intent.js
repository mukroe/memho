const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  console.log("Stripe key prefix:", process.env.STRIPE_SECRET_KEY.slice(0, 7)); 
  // Should log "sk_live"

  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
    }

    const { amount } = JSON.parse(event.body || "{}");

    if (!amount || amount < 50) {
      return { statusCode: 400, body: JSON.stringify({ error: "Invalid amount" }) };
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,             // in cents
      currency: "usd",
      description: "MemHo Order",
      automatic_payment_methods: { enabled: true }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ clientSecret: paymentIntent.client_secret })
    };
  } catch (err) {
    console.error("Function error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
