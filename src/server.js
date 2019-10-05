import express from "express";
import bodyParser from "body-parser";
import {MongoClient} from "mongodb";
import path from 'path';
const app = express();

app.use(express.static(path.join(__dirname,'/build')));

app.use(bodyParser.json());

const withDB = async (operations, res) => {
  try {
    const client = await MongoClient.connect("mongodb://localhost:27017", {
      useNewUrlParser: true
    });
    const db = client.db("baby-step");
    await operations(db);
    client.close();
  } catch (error) {
    res.status(500).json({
      message: "Error Connecting to db ( connection to Server ok",
      error
    });
  }
};

app.get("/api/articles/:name", async (req, res) => {
  withDB(async db => {
    const articleName = req.params.name;
    const articleInfo = await db
      .collection("articles")
      .findOne({name: articleName});
    res.status(200).json(articleInfo);
  }, res);
});

app.post("/api/articles/:name/upvote", async (req, res) => {
  withDB(async db => {
    const articleName = req.params.name;
    const articleInfo = await db
      .collection("articles")
      .findOne({name: articleName});
    await db.collection("articles").updateOne(
      {name: articleName},
      {
        '$set': {
          upvotes: articleInfo.upvotes +1
        }
      }
    );
    const updated = await db
      .collection("articles")
      .findOne({name: articleName});
    res.status(200).json(updated);
  }, res);
});

app.post("/api/articles/:name/add-comment", async (req, res) => {
  withDB(async db => {
    const {username, text} = req.body;
    const articleName = req.params.name;
    const articleInfo = await db
      .collection("articles")
      .findOne({name: articleName});
    await db.collection("articles").updateOne(
      {name: articleName},
      {
        '$set': {
          comments: articleInfo.comments.concat({username,text})
        }
      }
    );
    const updated = await db
      .collection("articles")
      .findOne({name: articleName});
    res.status(200).json(updated);
  }, res);
});

app.get('*', (req, res) =>{
       res.SendFile(path.join(__dirname,'/build/index.htmlcl'))
})

app.listen(8000, () => console.log("Listening on Port 8000"));
