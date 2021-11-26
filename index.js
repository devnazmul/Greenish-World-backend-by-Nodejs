const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

const app = express();

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASS}@cluster0.gu8bj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const PORT = process.env.PORT || 5000;

const run = async () => {
  try {
    await client.connect();
    console.log("mongoDB connected...");
    const db = client.db("greenish_world");
    const plantsCollection = db.collection("plants");
    const usersCollection = db.collection("users");
    const ordersCollection = db.collection("orders");
    const reviewsCollection = db.collection("reviews");
    const messagesCollection = db.collection("messages");
    const servicesCollection = db.collection("services");

    // ##################################################
    // ############## TESTING LIVE SERVER ###############
    // ##################################################
    app.get("/", (req, res) => {
      res.send("Server Is Running  ... ...");
    });

    // ##################################################
    // ################ GET OPERATIONS ##################
    // ##################################################
    // ########### GET OPERATION FOR PLANTS #############
    app.get("/plants", async (req, res) => {
      const cursor = plantsCollection.find({});
      const plants = await cursor.toArray();
      res.send({
        countData: cursor.count(),
        plants,
      });
    });
    // ########### GET OPERATION FOR USERS ##############
    app.get("/users", async (req, res) => {
      const cursor = usersCollection.find({});
      const users = await cursor.toArray();
      res.send({
        countData: cursor.count(),
        users,
      });
    });
    // ########### GET OPERATION FOR ORDERS #############
    app.get("/orders", async (req, res) => {
      const cursor = ordersCollection.find({});
      const orders = await cursor.toArray();
      res.send({
        countData: cursor.count(),
        orders,
      });
    });
    // ########### GET OPERATION FOR REVIEWS ############
    app.get("/reviews", async (req, res) => {
      const cursor = reviewsCollection.find({});
      const reviews = await cursor.toArray();
      res.send({
        countData: cursor.count(),
        reviews,
      });
    });
    // ########### GET OPERATION FOR SERVICES ###########
    app.get("/services", async (req, res) => {
      const cursor = servicesCollection.find({});
      const services = await cursor.toArray();
      res.send({
        countData: cursor.count(),
        services,
      });
    });
    // ########### GET OPERATION FOR MESSAGES ############
    app.get("/messages", async (req, res) => {
      const cursor = messagesCollection.find({});
      const messages = await cursor.toArray();
      res.send({
        countData: cursor.count(),
        messages,
      });
    });

    // ####################################################
    // ########### GET OPERATION WITH FILTER ##############
    // ####################################################
    // ######### GET OPERATION WITH FILTER FOR PLANTS #####
    app.get("/plant/:_id", async (req, res) => {
      const id = req.params._id;
      const query = { _id: ObjectId(id) };
      const plant = await plantsCollection.findOne(query);
      res.send(plant);
    });
    // ######### GET OPERATION WITH FILTER FOR USERS #####
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      console.log(email);
      const query = { email: email };
      const users = await usersCollection.findOne(query);
      res.send(users);
    });
    // ######### GET OPERATION WITH FILTER FOR CHECKING USERS ADMIN OR NOT #####
    app.get("/users/isAdmin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const users = await usersCollection.findOne(query);
      let isAdmin = false;
      if (users?.role === 'admin') {
        isAdmin = true
      }
      res.json({admin: isAdmin});
    });


    // ###################################################
    // ############### CREATE OR POST OPERATION  #########
    // ###################################################
    // ############## CREATE OPERATION FOR ORDER #########
    app.post("/orders", async (req, res) => {
      const data = req.body;
      const insertResult = await ordersCollection.insertOne(data);
      res.send(insertResult);
    });
    // ############## CREATE OPERATION FOR USERS #########
    app.post("/users", async (req, res) => {
      const data = req.body;
      const insertResult = await usersCollection.insertOne(data);
      res.send(insertResult);
    });
    // ############ CREATE OPERATION FOR PLANT ###########
    app.post("/plants", async (req, res) => {
      const data = req.body;
      const insertResult = await plantsCollection.insertOne(data);
      res.send(insertResult);
    });
    // ############ CREATE OPERATION FOR REVIEW ###########
    app.post("/reviews", async (req, res) => {
      const data = req.body;
      const insertResult = await reviewsCollection.insertOne(data);
      res.send(insertResult);
    });

    // ###################################################
    // ############ PUT OR UPDATE OPERATIONS #############
    // ###################################################
    // ############## PUT OR UPDATE FOR USERS ############
    app.put("/users", async (req, res) => {
      const data = req.body;
      const filter = { email: data.email };
      const updateDoc = { $set: data };
      const options = { upsert: true };
      const insertResult = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(insertResult);
    });
    // ############## UPDATE ROLE FOR USERS ############
    app.put("/user/admin", async (req, res) => {
      const email = req.body.email;
      console.log(email);
      const filter = { email: email };
      const updateDoc = { $set: {role: 'admin'} };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc
      );
      res.send(result);
    });
    // ############# UPDATE ORDER STATUS DONE #################
    app.put("/orders/done/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: `done`,
        },
      };
      const orders = ordersCollection.updateOne(query, updateDoc, options);
      res.send(orders);
    });

    // ###################################################
    // ################# DELETE OPERATIONS ###############
    // ###################################################
    // ######## DELETE OPERATION FOR PLANTS ########
    app.delete("/plants/:_id", async (req, res) => {
      const id = req.params._id;
      const query = { _id: ObjectId(id) };
      const newPlants = plantsCollection.deleteOne(query);
      res.send(newPlants);
    });
    // ######## DELETE OPERATION FOR ORDERS ########
    app.delete("/orders/:_id", async (req, res) => {
      const id = req.params._id;
      const query = { _id: ObjectId(id) };
      const response = ordersCollection.deleteOne(query);
      res.send(response);
    });

 
  } finally {
    // await client.close();
  }
};

run().catch((err) => {
  console.log(err);
});

app.listen(PORT, () => {
  console.log(`Server start on: http://localhost:${PORT}`);
});
