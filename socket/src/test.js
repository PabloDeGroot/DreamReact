var cert = fs.readFileSync('/etc/letsencrypt/live/duckhub.dev/fullchain.pem');
var key = fs.readFileSync('/etc/letsencrypt/live/duckhub.dev/privkey.pem');

import * as https from 'https';
const httpServer = https.createServer(
    {
        key: key,
        cert: cert
    }
);
httpServer.on('request', (req, res) => {
    res.writeHead(200, { 'content-type': 'text/plain' });
    res.end('Hello World\n');
});

httpServer.listen(2000);
console.log("starting server on port 2000")

