// This node.js application uses the node express package for the implementation of the web server
// MODULES: Here we define all the required modules and services
var express = require('express'); // critical module for building a Web Server App
// Here are some basic packages we need together with express
var bodyParser = require('body-parser'); // helper routines to parse data as JSON in request body
var request = require('request'); // http requests used for our proxy and cloudant outbound call
var basicAuth = require('express-basic-auth'); // Some basic HTTP Header Authorization
// Text to Audio modules
const TextToSpeechV1 = require('ibm-watson/text-to-speech/v1');
const IamAuthenticator = require('ibm-watson/auth');
// .env for vars
const dotenv = require('dotenv').config();
if (dotenv.error) throw dotenv.error;
// filesystem module to save audio to file
const fs = require('fs');
// create tts service
const textToSpeech = new TextToSpeechV1({
    authenticator: new IamAuthenticator({
        apikey: process.env.TextToSpeechIAMKey,
    }),
    url: process.env.TextToSpeechConfigurl,
    headers: {
        'X-Watson-Learning-Opt-Out': 'false',
    },
});

// create a new express based Web Server
var app = express();
app.use(express.static(__dirname + '/public')); // set base directory
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// -----------------------------------------------------------------------------
// This is a HTPP Basic Authentication Code fragment for potential use
// in this example we force a http basic authentication if there is a request
// with localhost:6001/admin
// -----------------------------------------------------------------------------
app.use('/admin', basicAuth({ authorizer: myAuthorizer, challenge: true }));
function myAuthorizer(username, password) {
    console.log('Erstmal anmelden hier');
    return username.startsWith('Asomething') && password.startsWith('secretstrange');
}
// -----------------------------------------------------------------------------
// Below commented code enables CORS, just in case you want to explore this
// option
// -----------------------------------------------------------------------------
app.use(function (req, res, next) {
    res.append('Access-Control-Allow-Origin', '*');
    res.append('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.post('/tts', function (req, res) {
    for (const key in req.body) {
        // set tts params
        const synthesizeParams = {
            voice: 'de-DE_DieterV3Voice',
            accept: 'audio/mp3',
            text: req.body[key],
        };
        var url = './public/sound/tts' + key + '.mp3';
        // synthesize text
        textToSpeech
            .synthesize(synthesizeParams)
            .then((response) => {
                response.result.pipe(fs.createWriteStream(url)).on('finish', function (fd) {
                    res.sendStatus(200);
                });
            })
            .catch((err) => {
                console.log('error:', err);
                res.sendStatus(500);
            });
    }
});
// -----------------------------------------------------------------------------
// localhost:6001/redirect
// will redirect us to the offical DHBW Homepage
// -----------------------------------------------------------------------------
app.get('/redirect', function (req, res) {
    res.redirect('https://www.dhbw-stuttgart.de/home/');
});
//------------------------------------------------------------------------------
// localhost:6001/proxy?url_to_be_proxied
// The incoming request will transfered using the request package
//------------------------------------------------------------------------------
app.all('/proxy', function (req, res) {
    var decompose = req.originalUrl.split('?');
    var fullurl = decompose[1] + '?' + decompose[2];
    fullurl = fullurl.replace('url=', '');
    console.log('Proxy Server reached', fullurl);
    var o = { uri: fullurl, method: req.method, json: true };
    request(o, function (e, r, b) {
        if (e) {
            res.send({ error: e, status: 'Fehler', request: o, response: e });
        } else {
            res.send({ error: e, status: r.statusCode, request: o, response: b });
        }
    });
});

// -----------------------------------------------------------------------------
// the WebServer now listens to http://localhost:6001 / http gets and posts
// -----------------------------------------------------------------------------
var server = app.listen(6001, function () {
    console.log('*******************************');
    console.log('Server listening on Port: ', 6001);
    console.log('*******************************');
});
