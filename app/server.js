const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const routes = require('./routes/routes');
const cors = require('cors')

app.set('port',process.env.PORT || 8080);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());
app.use("/",routes);





app.listen(app.get('port'),() => {
    console.log('Listening on ${server.address}.port}');
})

module.exports = app;
