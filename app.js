const express = require('express');
const fs = require('fs');
const createError = require('http-errors');
const logger = require('morgan');
const bodyParser = require('body-parser');
const { Client,LegacySessionAuth } = require('whatsapp-web.js');
const MULTI_DEVICE = process.env.MULTI_DEVICE || 'true';
const QRCode = require("qrcode") ;
const app = express();
const cors = require('cors');
app.use(cors());

app.use(logger('dev'));
app.use(bodyParser.urlencoded({
  extended: false
}));
function createClient  (session = {}, login = false)  {
    console.log(`Mode: ${(MULTI_DEVICE === 'false') ? 'No Multi-device' : 'Si Multi-device'} `)
    const objectLegacy = (login) ? {
        authStrategy: new LegacySessionAuth({
            session
        })
    } : {session};

    if(MULTI_DEVICE == 'false') {
       return {...objectLegacy,
        restartOnAuthFail: true,
        puppeteer: {
            args: [
                '--no-sandbox'
            ],
        }
    }
    }else{
        return {
            puppeteer: { 
                headless: true, 
                args: ['--no-sandbox'] 
            }, 
            clientId: 'client-one' 
        }
    }
}
const SESSION_FILE_PATH = './session.json';
let sessionCfg;
if (fs.existsSync(SESSION_FILE_PATH)) {
  sessionCfg = require(SESSION_FILE_PATH);
}
client = new Client(createClient(sessionCfg,true));

client.initialize();
// Add this after express code but before starting the server

client.on('qr', qr => {
    // NOTE: This event will not be fired if a session is specified.
    console.log('QR RECEIVED', qr);
    app.get('/getqr', (req, res, next) => {
      res.send({ qr });
    });
  });
  
  client.on('authenticated', session => {

    if(fs.existsSync("./qr.png") ){
        fs.unlinkSync('./qr.png');
    }
    console.log('CONECTADO');
   
  });
  
  client.on('auth_failure', msg => {
    // Fired if session restore was unsuccessfull
    console.error('AUTHENTICATION FAILURE', msg);
  });
  
  client.on('ready', () => {
    console.log('READY');
  });
  

// Run `npm i qrcode-terminal` before this

const qrcode = require('qrcode-terminal')

client.on('qr', qr => {
  // NOTE: This event will not be fired if a session is specified.

  if (qr){
    QRCode.toFile('qr.png', qr, {
      color: {
        dark: '#00F',  // Blue dots
        light: '#0000' // Transparent background
      }
    }, function (err) {
      if (err) throw err
      console.log('done')
    })
  } 
  console.log('QR RECEIVED', qr);
  qrcode.generate(qr, { small: true }); // Add this line
  app.get('/getqr', (req, res, next) => {
    if(fs.existsSync("qr.png")){
        res.sendFile('qr.png',{ root: __dirname });
       }else{
      res.send({ qr });
       }
  
  });
});
app.get('/' , async(req, res) => {

try {
  res.json({
    "tutorial": conn
  });
}catch (err) {
  res.json({
    "tutorial": err
  });
}


});
app.get('/qr.png', function(req,res){

    if(fs.existsSync("./qr.png")){
      res.sendFile('./qr.png',{ root: __dirname });
     }else{
        res.json("Archivo enviado");
     }
  
  
  });
  app.get('/recuperar',async(req, res) => {

    client.initialize()
  
     res.json("Listo");
    
  
  });
 
app.post('/sendmessage', async (req, res, next) => {
    try {
      const { number, message } = req.body; // Get the body
      const msg = await client.sendMessage(`${number}@c.us`, message); // Send the message
      res.send({ msg }); // Send the response
    } catch (error) {
      next(error);
    }
  });
  

  // Listening for the server
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`🚀 @ http://localhost:${PORT}`));
  
