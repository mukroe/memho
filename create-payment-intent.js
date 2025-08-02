const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); 
// Make sure STRIPE_SECRET_KEY is your **LIVE sk_live_ key**

exports.handler = async (event) => {
  try {
    if(event.httpMethod !== "POST"){
      return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
    }

    // Force $1 charge for live test
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 100,              // 100 cents = $1 live test
      currency: "usd",
      description: "MemHo Live $1 Test",
      automatic_payment_methods: { enabled: true }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ clientSecret: paymentIntent.client_secret })
    };

  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
