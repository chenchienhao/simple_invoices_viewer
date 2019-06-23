const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const fs = require('fs');
const path = require('path');
const parseString = require('xml2js').parseString;
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);
const readdirAsync = promisify(fs.readdir);

var invoices = new Array();
async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}
function xmlExtensionCheck(filename){
  if(path.extname(filename) == ".xml") {
    return true;
  }
  return false;
}
function requestReport(data,callback) {
  parseString(data, callback);
}
function readXMLFile( filename) {
  return new Promise( (resolve, reject)  => {
      readFileAsync(filename, 'UTF-8',
         (err, xml) => err ? reject(err) : resolve( xml)
      );
  });
}
async function addNames( placeName, csvFile) {
  let csv = await readCsvFile( csvFile);
  let arrays = await decodeCsv( csv);
  let names = arrays.map( item => item[0].toString());
  placeName.push.apply( placeName, names);
  return placeName;
}
// Get data Endpoint
app.get('/invoices', async (req, res) => {
  try{
    console.log('GET invoices request to homepage');
    invoices = new Array();
    var dirname = `${__dirname}/client/public/uploads/`;
    readdirAsync(dirname, async (errdir, filenames) => {
      await asyncForEach(filenames.filter(xmlExtensionCheck), async (filename) => {
        filename = dirname + filename;
        let xml = await readXMLFile( filename);
        requestReport(xml, (errReq, result) => {
          invoices.push(result);
        });
      });
      return res.status(200).json({invoices:invoices});
    });
  }
  catch (e) {
    throw e;
  }
});

app.use(fileUpload());

// Upload Endpoint
app.post('/upload', (req, res) => {
  if (req.files === null) {
    return res.status(400).json({ msg: 'No file uploaded' });
  }

  const file = req.files.file;

  file.mv(`${__dirname}/client/public/uploads/${file.name}`, err => {
    if (err) {
      console.error(err);
      return res.status(500).send(err);
    }

    res.json({ fileName: file.name, filePath: `/uploads/${file.name}` });
  });
});

app.listen(5000, () => console.log('Server Started...'));
