
const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY); // Secure via env variable

const app = express();
app.use(cors());
app.use(express.json());

app.post("/create-checkout-session", async (req, res) => {
  const { customer, cart } = req.body;

  try {
    const line_items = cart.map(item => ({
      price_data: {
        currency: "cad",
        product_data: {
          name: item.name,
          description: `Spice: ${item.spice || 'N/A'} | Note: ${item.note || 'None'}`
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.qty
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: customer.email,
      line_items,
      mode: 'payment',
      success_url: "https://your-site.com/success.html",
      cancel_url: "https://your-site.com/checkout.html"
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Checkout failed." });
  }
});

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
