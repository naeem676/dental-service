const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const  admin = require('firebase-admin');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()



const app = express();

const port = 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var serviceAccount = require("./genarateKey/dental-services-e030f-firebase-adminsdk-u6u4f-9e0d6c597c(1).json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.picct.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const petitionCollection = client.db('Doctor').collection("petition");
  
  app.post('/addPetition', (req, res)=>{
      const petition = req.body;
      petitionCollection.insertOne(petition)
      .then(result => {
        
        res.send(result.insertedCount > 0)
       
      })
  })

  app.get('/petitions', (req, res)=>{
    const bearer = req.headers.authorization
    if(bearer && bearer.startsWith('Bearer')){
        const idToken = bearer.split(' ')[1];
        
        // idToken comes from the client app
        admin
        .auth()
        .verifyIdToken(idToken)
        .then((decodedToken) => {
          const tokenEmail = decodedToken.email;
          const queryEmail = req.query.email;
          if(tokenEmail === queryEmail){
            petitionCollection.find({email : req.query.email})
                .toArray((err, documents)=>{
                  res.status(200).send(documents)
                })

          }
          
          // ...
        })
        .catch((error) => {
          // Handle error
        });

    }
    else{
      res.status(401).send('un-authorization access')
    }

    

    
  })
});


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(process.env.PORT || port)

