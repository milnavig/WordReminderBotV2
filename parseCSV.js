const fs = require('fs'); 
const parse = require('csv').parse;

const parseCSV = (path) => {
  return new Promise((resolve, reject) => {
  let csvData = [];
  fs.createReadStream(path)
    .pipe(parse({delimiter: ','}))
    .on('data', function(csvrow) {
      csvData.push(csvrow);        
    })
    .on('end', function() {
      //do something with csvData
      console.log('Parsed all data');
      csvData.shift();
      resolve(csvData);
    });
  });
}

module.exports = parseCSV;