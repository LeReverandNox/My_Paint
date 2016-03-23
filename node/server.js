/*jslint  this for bitwise */
(function () {
    "use strict";
    var paintServer = {
        infos: {
            port: 8080
        },
        wss: null,
        sockets: [],

        init: function () {
            var WebSocketServer = require('ws').Server;
            this.wss = new WebSocketServer(this.infos);
            console.log("Le sever est lancé sur le port " + this.infos.port);

            this.handleConnection();
        },
        handleConnection: function () {
            this.wss.on("connection", function (socket) {
                this.sockets.push(socket);
                console.log(this.sockets);
            });
        }
    };
    paintServer.init();
}());
