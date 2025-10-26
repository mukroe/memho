const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  try {
    // Handle both GET and POST requests safely
    let amount = 0;

    // Try POST body first
    if (event.body) {
      try {
        const data = JSON.parse(event.body);
        amount = data.amount || 0;
      } catch {
        console.warn("Could not parse body JSON");
      }
    }

    // Fallback: look for query string (works even if body missing)
    if (!amount && event.queryStringParameters && event.queryStringParameters.amount) {
      amount = parseInt(event.queryStringParameters.amount);
    }

    if (!amount) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing amount" }),
      };
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientSecret: paymentIntent.client_secret }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
