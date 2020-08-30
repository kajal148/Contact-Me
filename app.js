require('dotenv').config();
const nodemailer = require('nodemailer')
var express    = require('express'),
    bodyParser = require('body-parser'),
    app        = express()

const expressSanitizer = require('express-sanitizer');

app.use(bodyParser.urlencoded({extended:true}))
app.set('view engine','ejs')
app.use(express.static('public'))
app.use(express.json());
app.use(expressSanitizer());

//FIREBASE SETUP
var admin = require("firebase-admin");
var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://contact-me-2ff64.firebaseio.com"
});

const db = admin.firestore();

//ROUTES
app.get('/',(req,res)=>{
    res.redirect('/contact')
})

app.get('/contact',(req,res)=>{
    res.render('form.ejs')
})

app.post('/contact',(req,res)=>{

    req.body.message = req.sanitize(req.body.message);
    
    let info = {name : req.body.name,
        email : req.body.email,
        phone :  req.body.phone,
        message : req.body.message}

    //console.log(name,email,phone,message)

    db.collection('contact').doc('info').set(info).then(()=>{
        console.log('INFORMATION WRITTEN ON DATABASE');
    })

    //SENDING MAIL 
    var transport = nodemailer.createTransport({
        service:'gmail',
        auth:{
            user:process.env.EMAIL,
            pass:process.env.PASSWORD
        }
    });
      
    var mailOptions = {
        from: 'sendersmailaddress',
        to: 'receiversmailadderss',
        subject : ' Contact Me  ',
        text : 'NAME : '+info.name+'\n\nEMAIL : ' + info.email +'\n\nPHONE NUMBER : ' + info.phone + '\n\nMESSAGE : ' + info.message  
    };
    
    transport.sendMail(mailOptions,function(error,info){
        if(error){
            console.log(error)
        }else{
            res.render('submit.ejs')
            console.log("Email sent"+ info.response)
        }
    })

})



app.listen(8080)