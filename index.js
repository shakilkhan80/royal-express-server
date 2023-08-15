const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
const stripe = require('stripe')('sk_test_51Nd4HlC8pq8DDEmNl4RbHMm8k9p5By78t25JubotiaVPddLoLnDliu2sLSYnaiDdxK7vo27dPXjm0r3YRDzxaWPX00Iyn86yoO')
// TODO use secret key from .env file
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');



app.use(cors());
app.use(express.json());





const uri = "mongodb+srv://royalExpress:B8QtXz6EKSKdG4tk@cluster0.mh16alw.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    const areaCollection = client.db("royalExpress").collection("areaName");
    const usersCollection = client.db("royalExpress").collection("users");
    const ordersCollection = client.db("royalExpress").collection("orders");
    const paymentsCollection = client.db("royalExpress").collection("payments");



    //************************************************************users collection***************************************************

    app.get('/users', async (req, res) => {
      let query = {};
      if (req.query.email) {
        query = {
          email: req.query.email
        }

      }


      const users = await usersCollection.find(query).toArray();
      res.send(users);
    });


    app.post('/users', async (req, res) => {
      const user = req.body;
      console.log(user);
      const result = await usersCollection.insertOne(user);
      res.send(result);

    });



    //..........................................................area collection ......................................................


    app.get('/areas', async (req, res) => {
      const cursor = areaCollection.find()
      const result = await cursor.toArray();
      res.send(result);

    })


    //..................order..............

    app.post('/orders', async (req, res) => {
      const order = req.body;
      console.log(order);

      const result = await ordersCollection.insertOne(order);
      res.send(result);
    });


    app.get('/orders', async (req, res) => {
      let query = {};
      if (req.query.email) {
        query = {
          email: req.query.email
        }
      }
      const orders = await ordersCollection.find(query).toArray();
      res.send(orders);

    })
    // then the payment is done the user statues will be "Order Placed"
    app.put('/orders', async (req, res) => {
      const user = req.body;
      console.log(user)
      const options = { upsert: true }
      const id = user.id;
      const filter = { _id: new ObjectId(id) }
      const updatedDoc = {
        $set: {
          status: user.status
        }
      }
      const result = await ordersCollection.updateOne(filter, updatedDoc, options);
      res.send(result)
    })


    app.put('/manage-orders', async (req, res) => {
      const body = req.body;
      const options = { upsert: true };
      const id = body.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          status: body.status,


        }
      }
      console.log(updateDoc);
      const result = await ordersCollection.updateOne(filter, updateDoc, options);
      res.send(result);

    });
    //----------------- payment section------------
    app.post('/create-payment-intent', async (req, res) => {
      const { price } = req.body;
      const amount = price * 100;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        payment_method_types: ['card']
      });

      res.send({
        clientSecret: paymentIntent.client_secret
      })
    })

    // payment information api
    app.post('/payments', async (req, res) => {
      const payment = req.body;
      const result = await paymentsCollection.insertOne(payment);
      // console.log(result)
      res.send(result)
    })





    // .........................................
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
  res.send('Simple Crud Is Running');
})


app.listen(port, () => {
  console.log(`Server is running on PORT: ${port}`)
});