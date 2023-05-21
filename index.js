const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rlcgnwx.mongodb.net/?retryWrites=true&w=majority`;

// middleware
app.use(cors());
app.use(express.json());

console.log(process.env.DB_USER);



//mongodb




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
   client.connect();

    const toyCollection = client.db('toyMarketPlace').collection('toy');

    // getting data
    app.get('/toy', async(req,res) => {
        const cursor = toyCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })




    app.get('/toyseller', async (req, res) => {
      console.log("query", req.query?.value);
      let sort = parseInt("-1");
      if(req.query?.value == undefined){
        sort = 1;
      }
      else{
        sort = req.query.value;
      }


      
      let query = {};
      if (req.query?.seller_email) {
          query = { seller_email: req.query.seller_email }
      }
      const result = await toyCollection.find(query).sort({price:sort}).toArray();
      
      res.send(result);
  })

    app.get('/getall', async(req, res)=> {
      const cursor = await toyCollection.find().limit(20).toArray();
      res.send(cursor);
    })

    app.get('/toy/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await toyCollection.findOne(query);
      res.send(result);
    })



    app.post('/insert', async (req, res) => {
      const newToy = req.body;
      console.log(newToy);
      const result = await toyCollection.insertOne(newToy);
      res.send(result);
     
  });
  app.delete('/toy/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) }
    const result = await toyCollection.deleteOne(query);
    res.send(result);
})
app.put('/toy/:id', async (req, res) => {
  const id = req.params.id;
  const filter = {_id: new ObjectId(id)}

  const options = {upsert: true}
  const updateToy = req.body;
  const newToy = {
    $set: {
      price: updateToy.price, 
      available_quantity: updateToy.available_quantity, 
      detailed_description: updateToy.detailed_description 
    }
  }
  const result = await toyCollection.updateOne(filter,newToy, options);
  res.send(result);
  console.log(updateToy);
})


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('toy server is running')
})

app.listen(port, () => {
    console.log(`The toy Server is running on port ${port}`)
})