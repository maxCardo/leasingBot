const {MongoClient, ObjectID} = require('mongodb');
const creds = require('./config/keys');

const dataBase = process.env.MONGODB_URI;
const databaseUrlSplit = dataBase.split('/');
const dbName = databaseUrlSplit[3];

//custom db call for new leads from email parse
const newLead = (record) => {
  return new Promise(function(resolve, reject) {
    MongoClient.connect(dataBase, (err, client) => {
      if (err) {
        return console.log('Error: problem connecting to mongoDB');
      }
      const db = client.db(dbName);
      const phoneNumber = `+1${record.phoneNumber.replace(/[\s () -]/g, '')}`;

      db.collection('chats').findOneAndUpdate({
        phoneNumber: phoneNumber,
        property: record.property
      },{
        $set:{
          name:record.name,
          email:record.email,
          unread: true,
        },
        $push: {
          actionLog:{
            action:'emailParse lead',
            date:new Date(),
          },
          chats: {
            from: 'Admin',
            message: 'Inquired on ILS',
            Date: new Date
          },
        }
      },{
        upsert:true,
        returnNewDocument:true,
        returnOriginal: false
      }).then((res) => {
        resolve(res);
      });
    });
    //resolve();
  });
};

const updateChat = (id, record, from) => {
  return new Promise(function(resolve, reject) {
    MongoClient.connect(dataBase, (err, client) => {
      if (err) {
        return console.log('Error: problem connecting to mongoDB');
      }
      const db = client.db(dbName);

      db.collection('chats').findOneAndUpdate({
        phoneNumber: id
      },{
        $set:{
          unread: true,
          botRespond:false,
          last_active:new Date
        },
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
        resolve();
      });
    });
    //resolve();
  });
};

//grab all chats for sidebar on load
const getAllChats = () => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(dataBase, (err, client) => {
      if (err) {
      return console.log('Error: problem connecting to mongoDB getVendor');
      }
      const db = client.db(dbName);
      db.collection('chats').find({}).sort({last_active:-1}).toArray((err, res) => {
        if (err) throw err;
        resolve(res);
      })
    })
  });
}

const getChat = (id) => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(dataBase, (err, client) => {
      if (err) {
        return console.log('Error: problem connecting to mongoDB getVendor');
      }
      const db = client.db(dbName);
      db.collection('chats').findOneAndUpdate({'phoneNumber':id},{$set:{unread:false}}).then((value) => {
        resolve(value);
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


const getChat = (id) => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(dataBase, (err, client) => {
      if (err) {
      return console.log('Error: problem connecting to mongoDB getVendor');
      }
      const db = client.db(dbName);
      db.collection('chats').findOneAndUpdate({'phoneNumber':id},{$set:{unread:false}}).then((value) => {
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



module.exports = {newChat, getAllChats, updateChat, getChat, newLead};
