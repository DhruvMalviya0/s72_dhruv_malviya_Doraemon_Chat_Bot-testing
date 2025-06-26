const https = require('https');
const fs = require('fs');
const path = require('path');

const certUrl = 'https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem';
const certPath = path.join(__dirname, 'ca-certificate.crt');

https.get(certUrl, (response) => {
  const file = fs.createWriteStream(certPath);
  response.pipe(file);
  
  file.on('finish', () => {
    file.close();
    console.log('Certificate downloaded successfully');
  });
}).on('error', (err) => {
  console.error('Error downloading certificate:', err);
}); 