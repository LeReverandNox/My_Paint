/*jslint  this devel: true, node: true */
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

            this.wss.on("connection", this.handleConnection.bind(this));
        },

        handleConnection: function (socket) {
            var self = this;
            this.sockets.push(socket);

            socket.on("message", function (msg) {
                self.broacast(msg, socket);
            });
        },
        broacast: function (msg, origin) {
            this.wss.clients.forEach(function (client) {
                if (client !== origin) {
                    client.send(msg);
                }
            });
        }
    };
    paintServer.init();
}());