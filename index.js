const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleWare
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.slr2lcz.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const db = client.db("dragon_news");

    const newsCollection = db.collection("news");
    const categoriesCollection = db.collection("categories");

    // get All News
    app.get("/all-news", async (req, res) => {
      const allNews = await newsCollection.find().toArray();
      res.send({ status: true, message: "success", data: allNews });
    });
    // get All Categories
    app.get("/categories", async (req, res) => {
      const categories = await categoriesCollection.find({}).toArray();
      res.send({ status: true, message: "success", data: categories });
    });
    // get specific news
    app.get("/news/:id", async (req, res) => {
      const id = req.params.id;
      const news = await newsCollection.findOne({ _id: new ObjectId(id) });
      res.send({ status: true, message: "success", data: news });
      //   console.log(news);
    });
    // get specific categories

    app.get("/news", async (req, res) => {
      const name = req.query.category;
      let newses = [];
      if (name == "all-news") {
        newses = await newsCollection.find({}).toArray();
        return res.send({ status: true, message: "success", data: newses });
      }
      newses = await newsCollection
        .find({ category: { $regex: name, $options: "i" } })
        .toArray();
      res.send({ status: true, message: "success", data: newses });
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("News Server is runnig");
});

app.listen(port, () => {
  console.log(`The News Server Is Running On port ${port}`);
});
