const fs = require('fs'); 
const parse = require('csv').parse;

module.exports = async function parseCSV(path, callback) {
  let csvData = [];
  fs.createReadStream(path)
    .pipe(parse({delimiter: ','}))
    .on('data', function(csvrow) {
      //console.log(csvrow);
      csvData.push(csvrow);        
    })
    .on('end', function() {
      //do something with csvData
      console.log('Parsed all data');
      csvData.shift();
      callback(csvData);
    });
}