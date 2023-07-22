require("dotenv/config");
const HTTP = require("http");
const EXPRESS = require('express');
const MONGOOSE = require('mongoose');
const BODY_PARSER = require('body-parser');
const CORS = require('cors');
const { Server } = require("socket.io");

const ADMIN_ROUTES = require('./routes/admin_routes');
const CITIZEN_ROUTES = require('./routes/citizen_routes');
const CLERK_ROUTES = require("./routes/clerk_routes");

const { res_generator } = require("./helpers/response_generator");

const APP = EXPRESS();
const SERVER = HTTP.createServer(APP);
const IO = new Server(SERVER, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PATCH", "DELETE"]
    }
});

APP.use(BODY_PARSER.json({ limit: '50mb' }));
APP.use(BODY_PARSER.urlencoded({ limit: '50mb', extended: true }));
APP.use(CORS());

APP.use('/admin', ADMIN_ROUTES);
APP.use('/citizen', CITIZEN_ROUTES);
APP.use('/clerk', CLERK_ROUTES);
APP.use("/*", (req, res) => {
    res.send(res_generator(req.body, true, "404 not found!"));
});



IO.on("connect", socket => {
    console.log("one connected")
    socket.emit("get_my_socket_id", socket.id)

    socket.on('citizen-ready-to-join', (data) => {
        socket.to(data.clerk).emit('citizen-ready-to-join', { citizen: data.citizen, slot: data.slot })
    })

    socket.on('other-verification-in-process', (citizen) => {
        socket.to(citizen).emit('other-verification-in-progress');
    });
    socket.on("disconnect", () => {
        socket.broadcast.emit("callEnded")
    })

    socket.on("callUser", (data) => {
        socket.to(data.userToCall).emit("callUser", { signal: data.signalData, from: data.from })
    })

    socket.on("answerCall", (data) => {
        console.log(data);
        socket.to(data.to).emit("callAccepted", data.signal)
    })

})

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












