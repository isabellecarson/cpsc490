/* Database */
const DB_HOST = 'us-cdbr-iron-east-01.cleardb.net';
const DB_USER = 'bb6c87f9bc3309';
const DB_PASSWORD = 'c867135e';
const DB_NAME = 'heroku_c1ea66fb35bb9fa';

/* AWS */
const ID = 'AKIA5MSHNIMG4KOY5GWD';
const SECRET = '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';
const BUCKET_NAME = 'mhgap-videos'

const path = require('path');
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const mysql = require('mysql')
const AWS = require('aws-sdk')
const formidable = require('formidable')
var util = require('util')
var moment = require('moment')
const url = require('url')

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())

function dbConnError(res, err) {
  console.error('Error connecting to database', err, err.message, err.stack);
  res.status(400);
  res.send(err);
}

var pool      =    mysql.createPool({
    connectionLimit : 100, //important
    host     : DB_HOST,
    user     : DB_USER,
    password : DB_PASSWORD,
    database : DB_NAME,
    debug    :  false
});

const s3 = new AWS.S3({
    accessKeyId: ID,
    secretAccessKey: SECRET
}); 

const s3Stream = require('s3-upload-stream')(s3);

function queryError(res, err) {
  console.log('Query error', err, err.message, err.stack);
  res.status(400);
  res.send(err);
}

function getQuerySuccess(results, response) {
  console.log("Query is successful.");
  response.status(200);
  response.json(results);
  console.log(results);
}

const uploadVideo = (request, response) => {
  const queryObject = url.parse(request.url,true).query;
  console.log(queryObject)
  const disorder = queryObject.disorder;
  const step = queryObject.step;

  const form = new formidable.IncomingForm()
  form.on('progress', function(bytesReceived, bytesExpected) {
    console.log('onprogress', parseInt( 100 * bytesReceived / bytesExpected ), '%');
  });

  form.on('error', function(err) {
    console.log('err',err);
  });

  form.on('aborted', function() {
    console.log('aborted', arguments);
  });

  form.onPart = function(part) {
    console.log('part',part);

    var upload = s3Stream.upload({
      "Bucket": BUCKET_NAME,
      "Key": part.filename,
      "ContentType": part.mime
    });

    upload.on('error', function (error) {
      console.log('errr',error);
    });

    upload.on('part', function (details) {
      console.log('part',details);
    });

    upload.on('uploaded', function (details) {
      console.log('uploaded', details);
      const newurl = details.Location;
      console.log(newurl);

      pool.getConnection(function(err, client) {
        if (err) {
          dbConnError(res, err);
          return;
        }

        client.query('SELECT * FROM videos WHERE disorder = ? AND step = ?',
                    [disorder, step], (err, results) => {
          client.release();
          if (err) {
            queryError(results, err);
          }
          console.log("Query is successful.");
          
          if (results && results.length) { /* a video exists in the database for this step */
            const oldURL = new URL(results[0].url);
            const name = oldURL.pathname.replace(/\//g,'');
            console.log(name);

            if (name.localeCompare(details.Key) !== 0) {
              var params = {  
                "Bucket": BUCKET_NAME, 
                "Key": name
              }; 
              /* delete video previously assigned to page in database from s3 bucket */
              s3.deleteObject(params, function(err, data) {
                if (err) console.log(err, err.stack);  
                console.log("Deleted previous video from s3 bucket.")
              }); 
            }
          }
        });
      });

      pool.getConnection(function(err, client) {
        if (err) {
          dbConnError(res, err);
          return;
        }

        client.query('REPLACE INTO videos (disorder, step, url) VALUES (?,?,?)',
                      [disorder, step, newurl], (err, results) => {
          client.release();
          if (err) {
            queryError(results, err);
          }
          console.log("Query is successful.");
        });
      }); 
    });

    part.pipe(upload);
  };

  form.parse(request, function(err, fields, files) {
    console.log('err',arguments);
    response.writeHead(200, {'content-type': 'text/plain'});
    response.write('received upload:\n\n');
    response.end(util.inspect({fields: fields, files: files}));
  });

  return;
}

const getPatients = (request, response) => {
  pool.getConnection(function(err, client, done) {
    if (err) {
      dbConnError(res, err);
      return;
    }
    client.query('SELECT * FROM patients', (err, results) => {
      client.release();
      if (err) {
        queryError(results, err);
        return;
      }
      getQuerySuccess(results, response);
    });
  });
}

const addPatient = (request, response) => {
  pool.getConnection(function(err, client) {
    if (err) {
      dbConnError(res, err);
      return;
    }
    const { patient_firstName, patient_lastName, step2, step3, step4, step5, step6, step7, step8, step9, Examiner } = request.body
    const submit_date = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')
    console.log(request.body)

    client.query('INSERT INTO patients (patient_firstName, patient_lastName, step1, step2, step3, step4, step5, step6, step7, step8, Examiner, submit_date) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)', 
                  [patient_firstName, patient_lastName, step1, step2, step3, step4, step5, step6, step7, step8, Examiner, submit_date], (err, results) => {
      client.release();
      if (err) {
        queryError(results, err);
      }
      getQuerySuccess(results, response);
    });
  });
}

const getVideo = (request, response) => {
  pool.getConnection(function(err, client, done) {
    if (err) {
      dbConnError(res, err);
      return;
    }
    const disorder = request.query['disorder']
    const step = request.query['step']
    console.log(request.body)

    client.query('SELECT * FROM videos WHERE disorder = ? AND step = ?',
                  [disorder, step], (err, results) => {
      client.release();
      if (err) {
        queryError(results, err);
      }
      getQuerySuccess(results, response);
    });
  });
}

const addVideo = (request, response) => {
  pool.getConnection(function(err, client) {
    if (err) {
      dbConnError(res, err);
      return;
    }
    const { disorder, step, url } = request.body
    console.log(request.body)

    client.query('REPLACE INTO videos (disorder, step, url) VALUES (?,?,?)',
                  [disorder, step, url], (err, results) => {
      client.release();
      if (err) {
        queryError(results, err);
      }
      getQuerySuccess(results, response);
    });
  }); 
}

app
  .route('/patients')
  // GET endpoint
  .get(getPatients)
  // POST endpoint
  .post(addPatient)

app
  .route('/videos')
  // GET endpoint
  .get(getVideo)
  // POSsT endpoint
  .post(addVideo)

app
  .route('/uploadVideo')
  .post(uploadVideo)


const PORT = process.env.PORT || 3000;

app.use('/', express.static(path.join(__dirname, 'testheroku')));

app.listen(PORT, () => {
  console.log('Express server listening on port', PORT)
});