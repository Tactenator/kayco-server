const env = require('dotenv').config({path:__dirname+'/.env'});
const fetch = require('node-fetch')

const express = require('express')
const app = express(); 
const cors = require("cors");

app.use(express.json())
app.use(express.static("public"))

app.use(
  cors({
    origin: "https://neon-boba-a555e1.netlify.app",
  })
)

let Stripe = require("stripe")(env.parsed.STRIPE_PRIVATE_KEY)
let products; 
let storeItems;

fetch(process.env.DATA_URL)
  .then(res => res.json())
  .then(data => {
    products = data;
   })
  .then(() => {
    storeItems = products.map(item => ({id: item.id, name: item.name, price: item.actualPrice }))

   });

   app.post("/create-checkout-session", async (req, res) => {
    const session = await Stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: req.body.items.map(item => {
        console.log(req.body.items)
       const storeItem = storeItems.find(e => e.id === item.id)
       return {
        price_data: {
          currency: 'usd', 
          product_data: {
            name: storeItem.name
          }, 
          unit_amount: storeItem.price
        }, 
        quantity: item.quantity
       }  
      }),
      mode: "payment",
      success_url: "http://localhost:5500/success",
      cancel_url: "http://localhost:5500/cancel",
    });
  
    res.json({url: session.url}) // <-- this is the changed line
  });

app.listen(3000, () => {
  console.log('Listening')
})