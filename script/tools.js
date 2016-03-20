/*jslint browser this */
/*global _, utils */

(function (global) {
    "use strict";

    var tools = {
        pencil: null,
        eraser: null,
        rectangle: null,
        circle: null
    };

    var Tool = {
        currentContext: null,
        currentCanvas: null,
        tmpContext: null,
        tmpCanvas: null,
        contextWidth: null,
        contextHeight: null,
        toolThickness: 10,
        toolEnd: "round",
        toolFIll: false,
        toolColorHex: "#00ff2c",
        toolColorRGB: {
            r: null,
            g: null,
            b: null
        },
        toolColorHSL: {
            h: null,
            s: null,
            l: null
        },
        click1: false,
        click2: false,
        origin: {
            x: null,
            y: null
        },
        destination: {
            x: null,
            y: null
        }
    };

    var toolFactory = {
        new: function (tool) {
            var newTool = Object.assign({}, Tool, tools[tool]);
            return newTool;
        }
    };
    tools.pencil = {
        handleMouseDown: function (mouse) {
            this.click1 = true;
            this.currentContext.beginPath();
            this.currentContext.moveTo(mouse.layerX, mouse.layerY);
        },
        handleMouseMove: function (mouse) {
            if (this.click1 === true) {
                this.destination.x = mouse.layerX;
                this.destination.y = mouse.layerY;

                this.currentContext.globalCompositeOperation = "source-over";
                this.currentContext.lineCap = this.toolEnd;
                this.currentContext.lineTo(this.destination.x, this.destination.y);
                this.currentContext.strokeStyle = this.toolColorHex;
                this.currentContext.lineWidth = this.toolThickness;
                this.currentContext.stroke();
            }
        },
        handleMouseUp: function (mouse) {
            this.click1 = false;
        }
    };
    tools.eraser = {
        handleMouseDown: function (mouse) {
            this.click1 = true;
            this.currentContext.beginPath();
            this.currentContext.moveTo(mouse.layerX, mouse.layerY);
        },
        handleMouseMove: function (mouse) {
            if (this.click1 === true) {
                this.destination.x = mouse.layerX;
                this.destination.y = mouse.layerY;

                this.currentContext.globalCompositeOperation = "destination-out";
                this.currentContext.lineCap = this.toolEnd;
                this.currentContext.lineTo(this.destination.x, this.destination.y);
                this.currentContext.strokeStyle = this.toolColorHex;
                this.currentContext.lineWidth = this.toolThickness;
                this.currentContext.stroke();
            }
        },
        handleMouseUp: function (mouse) {
            this.click1 = false;
        }
    };
    tools.rectangle = {
        handleMouseDown: function (mouse) {
            this.click1 = true;
            this.origin.x = mouse.layerX;
            this.origin.y = mouse.layerY;

            this.tmpContext.moveTo(mouse.layerX, mouse.layerY);
        },
        handleMouseMove: function (mouse) {
            if (this.click1 === true) {
                this.tmpContext.beginPath();

                this.tmpContext.clearRect(0, 0, this.contextWidth, this.contextHeight);

                var dist = {
                    x: mouse.layerX - this.origin.x,
                    y: mouse.layerY - this.origin.y
                };


                this.tmpContext.lineCap = this.toolEnd;
                this.tmpContext.strokeStyle = this.toolColorHex;
                this.tmpContext.lineWidth = this.toolThickness;

                this.tmpContext.rect(this.origin.x, this.origin.y, dist.x, dist.y);
                if (this.toolFIll === true) {
                    this.tmpContext.fillStyle = this.toolColorHex;
                    this.tmpContext.fill();
                } else {
                    this.tmpContext.stroke();
                }
            }
        },
        handleMouseUp: function (mouse) {
            this.click1 = false;
            this.currentContext.globalCompositeOperation = "source-over";
            this.currentContext.drawImage(this.tmpCanvas, 0, 0);
            this.tmpContext.clearRect(0, 0, this.contextWidth, this.contextHeight);

        }
    };
    tools.circle = {
        handleMouseDown: function (mouse) {
            this.click1 = true;
            this.origin.x = mouse.layerX;
            this.origin.y = mouse.layerY;

            this.tmpContext.moveTo(mouse.layerX, mouse.layerY);
        },
        handleMouseMove: function (mouse) {
            if (this.click1 === true) {
                this.tmpContext.beginPath();

                this.tmpContext.clearRect(0, 0, this.contextWidth, this.contextHeight);

                var dist = {
                    x: mouse.layerX - this.origin.x,
                    y: mouse.layerY - this.origin.y
                };
                var radius = Math.sqrt((Math.pow(dist.x, 2) + Math.pow(dist.y, 2)));

                this.tmpContext.lineCap = this.toolEnd;
                this.tmpContext.strokeStyle = this.toolColorHex;
                this.tmpContext.lineWidth = this.toolThickness;
                this.tmpContext.arc(this.origin.x, this.origin.y, radius, 0, Math.PI * 2);

                if (this.toolFIll === true) {
                    this.tmpContext.fillStyle = this.toolColorHex;
                    this.tmpContext.fill();
                } else {
                    this.tmpContext.stroke();
                }
                this.tmpContext.closePath();
            }
        },
        handleMouseUp: function (mouse) {
            this.click1 = false;
            this.currentContext.globalCompositeOperation = "source-over";
            this.currentContext.drawImage(this.tmpCanvas, 0, 0);
            this.tmpContext.clearRect(0, 0, this.contextWidth, this.contextHeight);

        }
    };

    // Expose l'objet à l'exterieur du scope de la fonction.
    // Depuis l'extérieur, vous pouvez l'utilisé ainsi :
    // var monDestroyer = shipFactory.build(shipFactory.TYPE_DESTROYER)
    global.Tool = Tool;
    global.toolFactory = toolFactory;
    global.tools = tools;
}(this));
