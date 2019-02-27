const {MongoClient, ObjectID} = require('mongodb');
const creds = require('./config/keys');

const dataBase = process.env.MONGODB_URI;
const databaseUrlSplit = dataBase.split('/');
const dbName = databaseUrlSplit[3];

console.log('dbname: ',dbName);

//grab all chats for sidebar on load
const getAllChats = () => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(dataBase, (err, client) => {
      if (err) {
      return console.log('Error: problem connecting to mongoDB getVendor');
      }
      const db = client.db(dbName);
      db.collection('chats').find({}).toArray((err, res) => {
        if (err) throw err;
        resolve(res);
      })

    })
  });
}

//create new chat
const newChat = (record) => {
  return new Promise(function(resolve, reject) {
    MongoClient.connect(dataBase, (err, client) => {
      if (err) {
        return console.log('Error: problem connecting to mongoDB');
      }
      console.log('Connected to mongoDB');
      const db = client.db(dbName);
      db.collection('chats').findOne({name: record.name}).then((value) => {
        if (value) {
          console.log('return customer');
          resolve();
        }else {
          console.log('creating new record');
          db.collection('chats').insertOne(record,(err, res) => {

            if (err) {
              return console.log('Error: and error occurd on insertOne', err);
            }
            resolve(res.ops[0]);
          });
        }
      })
    });
  });
}

const updateChat = (id, record, from) => {
  return new Promise(function(resolve, reject) {
    MongoClient.connect(dataBase, (err, client) => {
      if (err) {
        return console.log('Error: problem connecting to mongoDB');
      }
      const db = client.db(dbName);

      db.collection('chats').findOneAndUpdate({
        name: id
      },{
        $push: {
          chats: {
            from: from,
            message:record,
            Date: new Date
          },
        }
      },{
        upsert:true,
        returnNewDocument:true,
        returnOriginal: false
      }).then((res) => {
      });
    });
    resolve();
  });
};

const getChat = (id) => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(dataBase, (err, client) => {
      if (err) {
      return console.log('Error: problem connecting to mongoDB getVendor');
      }
      const db = client.db(dbName);
      db.collection('chats').findOne({'name':id}).then((value) => {
        resolve(value);
      })
    })
  });
}



// // ---------------------------get all records where service type matches-------------------------------------
// const getVendor = (location, serviceType) => {
//   return new Promise((resolve, reject) => {
//     MongoClient.connect(dataBase, (err, client) => {
//       if (err) {
//       return console.log('Error: problem connecting to mongoDB');
//       }
//       console.log('connected to mongoDB');
//       const db = client.db('crdo_req_test');
//       db.collection('vendors').find({'skillSet':{[serviceType]:true}}).toArray().then((value) => {
//         console.log(value);
//         resolve(value);
//       })
//     })
//   });
// }

// -------------------------------get one vendor that matches service type ---------------------------------------
const getVendor = (serviceType) => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(dataBase, (err, client) => {
      if (err) {
      return console.log('Error: problem connecting to mongoDB getVendor');
      }
      console.log('connected to mongoDB');
      const db = client.db(dbName);
      db.collection('vendors').findOne({'skillSet':{[serviceType]: true}}).then((value) => {
        resolve(value);
      })
    })
  });
}

const getServiceOrder = (ID) => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(dataBase, (err, client) => {
      if (err) {
      return console.log('Error: problem connecting to mongoDB getServiceOrder');
      }
      console.log('connected to mongoDB');
      const db = client.db(dbName);
      db.collection('firstReq').findOne({_id:new ObjectID(ID)}).then((value) => {
        resolve(value);
      })
    })
  });
}



module.exports = {newChat, getAllChats, updateChat, getChat};
