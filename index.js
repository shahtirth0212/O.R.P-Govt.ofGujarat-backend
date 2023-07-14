require("dotenv/config");
const EXPRESS = require('express');
const MONGOOSE = require('mongoose');
const BODY_PARSER = require('body-parser');
const CORS = require('cors');



const ADMIN_ROUTES = require('./routes/admin_routes');
const CITIZEN_ROUTES = require('./routes/citizen_routes');
const { res_generator } = require("./helpers/response_generator");

const SERVER = EXPRESS();
SERVER.use(BODY_PARSER.json({ limit: '50mb' }));
SERVER.use(BODY_PARSER.urlencoded({ limit: '50mb', extended: true }));
SERVER.use(CORS());

SERVER.use('/admin', ADMIN_ROUTES);
SERVER.use('/citizen', CITIZEN_ROUTES);



SERVER.use("/*", (req, res) => {
    res.send(res_generator(req.body, true, "404 not found!"));
});


const PORT = process.env.PORT || 5000;
MONGOOSE.connect(process.env.DB_CONNECTION)
    .then(() => {
        console.log(`
        \n---------------------------------\n
        Connected to the DB\n
        Server listening at port ${PORT}        
    `);
        SERVER.listen(PORT);
    })
    .catch((error) => console.log('Error connecting to the Database.'));



