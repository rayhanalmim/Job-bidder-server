const express = require('express');
const cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config()
const port = process.env.PORT || 3000;

// TaLNqw3qBhoZD1Cy
// jobbidder

console.log(process.env.SECRET);
console.log(process.env.ID);
console.log(process.env.PASS);


app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.ID}:${process.env.PASS}@cluster0.tdvw5wt.mongodb.net/?retryWrites=true&w=majority`;

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


    const jobsCollection = client.db("JobsBidderHub").collection("jobs");
    const bidsCollection = client.db("JobsBidderHub").collection("bids");

    // --------------------------jwt-----------------------------------
    app.post('/jwt', async (req, res) => {
      const user = req.body;
      console.log(user);

      const token = jwt.sign(user, process.env.SECRET, {
          expiresIn: '1h'
      });

      res
          .cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
          })
          .send({ success: true })
  })

    // -------------------other_api------------------------------

    app.get('/jobs', async (req, res) => {
      const result = await jobsCollection.find().toArray();
      res.send(result)
    })

    app.get('/jobs/:id', async (req, res) => {
      const id = req.params.id;
      const cursor = { _id: new ObjectId(id) };
      const result = await jobsCollection.findOne(cursor);
      res.send(result);
    })



    app.get('/edit/:id', async (req, res) => {
      const id = req.params.id;
      const cursor = { _id: new ObjectId(id) };
      const result = await jobsCollection.findOne(cursor);
      res.send(result);
    })

    app.get('/myjobs', async (req, res) => {
      console.log(req.query.email);

      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email }
      }
      const result = await jobsCollection.find(query).toArray();
      res.send(result);
    })

    app.get('/mybids', async (req, res) => {
      console.log(req.query.email);

      let query = {};
      if (req.query?.email) {
        query = { clintEmail: req.query.email }
      }
      const result = await bidsCollection.find(query).toArray();
      res.send(result);
    })
    // -----------------------------sort--------------------------
    app.get('/sortedmybids', async (req, res) => {
      console.log(req.query.email);
      console.log(req.query.sortby)
      const sortby = req.query.sortby;

      let query = {};
      if (req.query?.email) {
        query = { clintEmail: req.query.email }
      }
      const data = await bidsCollection.find(query).toArray();
      const sortedData = data.sort((a, b) => {
            if (a.status === sortby) return -1;
            if (b.status === sortby) return 1;
            return 0;
        });
      res.send(sortedData);
    })

    app.get('/bidsreq', async (req, res) => {
      console.log(req.query.email);

      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email }
      }
      const result = await bidsCollection.find(query).toArray();
      res.send(result);
    })

    app.post('/jobs', async (req, res) => {
      const data = req.body;
      const result = await jobsCollection.insertOne(data);
      res.send(result);
    })

    app.post('/bids', async (req, res) => {
      const data = req.body;
      const result = await bidsCollection.insertOne(data);
      res.send(result);
    })

    app.put('/edit/:id', async (req, res) => {
      const jobs = req.body;
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      console.log("jobs and id : ", jobs, id)
      const updateDoc = {
        $set: {
          email : jobs.email,
          category : jobs.category,
          jobTitle : jobs.jobTitle,
          deadline : jobs.deadline,
          maxPrice : jobs.maxPrice,
          minPrice : jobs.minPrice,
          description : jobs.description,
          shortDescription : jobs.shortDescription,
        },
      };
      const result = await jobsCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    })

    app.put('/status/:id', async (req, res) => {
      const status = req.body;
      const id = req.params.id;
      const filter = { _id: id };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status : status.status,
        },
      };
      const result = await bidsCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    })

    app.put('/approve/:id', async (req, res) => {
      const status = req.body;
      const id = req.params.id;
      const filter = { _id: id };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status : status.status,
        },
      };
      const result = await bidsCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    })

    app.put('/complite/:id', async (req, res) => {
      const status = req.body;
      const id = req.params.id;
      const filter = { _id: id };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status : status.status,
        },
      };
      const result = await bidsCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    })

    app.delete('/delete/:id', async(req, res)=>{
      console.log('jello')
      const id = req.params.id;
      const jobs = { _id: new ObjectId(id) };
      const result = await jobsCollection.deleteOne(jobs);
      res.send(result);
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
  res.send('jobbidder server is running')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})