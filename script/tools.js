/*jslint browser this */
/*global paint*/

(function (global) {
    "use strict";

    var tools = {
        pencil: null,
        eraser: null,
        rectangle: null,
        circle: null,
        line: null,
        eyedropper: null
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
        toolFill: false,
        toolStrokeColorHex: "#00ff2c",
        toolStrokeColorRGB: {
            r: null,
            g: null,
            b: null
        },
        toolStrokeColorHSL: {
            h: null,
            s: null,
            l: null
        },
        toolFillColorHex: "#ff0000",
        toolFillColorRGB: {
            r: null,
            g: null,
            b: null
        },
        toolFillColorHSL: {
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
            var newTool = Object.create(Tool);
            Object.assign(newTool, tools[tool]);

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

                this.currentContext.lineCap = this.toolEnd;
                this.currentContext.lineTo(this.destination.x, this.destination.y);
                this.currentContext.strokeStyle = this.toolStrokeColorHex;
                this.currentContext.lineWidth = this.toolThickness;
                this.currentContext.stroke();
            }
        },
        handleMouseUp: function () {
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
                this.currentContext.strokeStyle = this.toolStrokeColorHex;
                this.currentContext.lineWidth = this.toolThickness;
                this.currentContext.stroke();
            }
        },
        handleMouseUp: function () {
            this.click1 = false;
            this.currentContext.globalCompositeOperation = "source-over";
        }
    };
    tools.rectangle = {
        handleMouseDown: function (mouse) {
            this.click1 = true;
            this.origin.x = mouse.layerX;
            this.origin.y = mouse.layerY;
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
                this.tmpContext.strokeStyle = this.toolStrokeColorHex;
                this.tmpContext.lineWidth = this.toolThickness;

                this.tmpContext.rect(this.origin.x, this.origin.y, dist.x, dist.y);
                if (this.toolFill === true) {
                    this.tmpContext.fillStyle = this.toolFillColorHex;
                    this.tmpContext.fill();
                }
                this.tmpContext.stroke();
                this.tmpContext.closePath();
            }
        },
        handleMouseUp: function () {
            this.click1 = false;
            this.currentContext.drawImage(this.tmpCanvas, 0, 0);
            this.tmpContext.clearRect(0, 0, this.contextWidth, this.contextHeight);

        }
    };
    tools.circle = {
        handleMouseDown: function (mouse) {
            this.click1 = true;
            this.origin.x = mouse.layerX;
            this.origin.y = mouse.layerY;
        },
        handleMouseMove: function (mouse) {
            if (this.click1 === true) {
                this.tmpContext.beginPath();

                this.tmpContext.clearRect(0, 0, this.contextWidth, this.contextHeight);

                var dist = {
                    x: mouse.layerX - this.origin.x,
                    y: mouse.layerY - this.origin.y
                };
                var radius = Math.sqrt(Math.pow(dist.x, 2) + Math.pow(dist.y, 2));

                this.tmpContext.lineCap = this.toolEnd;
                this.tmpContext.strokeStyle = this.toolStrokeColorHex;
                this.tmpContext.lineWidth = this.toolThickness;
                this.tmpContext.arc(this.origin.x, this.origin.y, radius, 0, Math.PI * 2);

                if (this.toolFill === true) {
                    this.tmpContext.fillStyle = this.toolFillColorHex;
                    this.tmpContext.fill();
                }
                this.tmpContext.stroke();
                this.tmpContext.closePath();
            }
        },
        handleMouseUp: function () {
            this.click1 = false;
            this.currentContext.drawImage(this.tmpCanvas, 0, 0);
            this.tmpContext.clearRect(0, 0, this.contextWidth, this.contextHeight);

        }
    };
    tools.line = {
        handleMouseDown: function (mouse) {
            this.click1 = true;
            this.origin.x = mouse.layerX;
            this.origin.y = mouse.layerY;

        },
        handleMouseMove: function (mouse) {
            if (this.click1 === true) {
                this.tmpContext.beginPath();

                this.tmpContext.moveTo(this.origin.x, this.origin.y);

                this.tmpContext.clearRect(0, 0, this.contextWidth, this.contextHeight);

                this.tmpContext.lineCap = this.toolEnd;
                this.tmpContext.strokeStyle = this.toolStrokeColorHex;
                this.tmpContext.lineWidth = this.toolThickness;

                this.tmpContext.lineTo(mouse.layerX, mouse.layerY);

                this.tmpContext.stroke();
                this.tmpContext.fill();

                this.tmpContext.closePath();
            }
        },
        handleMouseUp: function () {
            this.click1 = false;
            this.currentContext.drawImage(this.tmpCanvas, 0, 0);
            this.tmpContext.clearRect(0, 0, this.contextWidth, this.contextHeight);
        }
    };
    tools.eyedropper = {
        handleMouseDown: function (mouse) {
            this.origin.x = mouse.layerX;
            this.origin.y = mouse.layerY;

            var arrRgb = this.currentContext.getImageData(this.origin.x, this.origin.y, 1, 1).data;
            var rgb = {
                r: arrRgb[0],
                g: arrRgb[1],
                b: arrRgb[2]
            };

            Tool.toolStrokeColorHex = paint.rgbToHex(rgb);
            Tool.toolFillColorHex = paint.rgbToHex(rgb);
            console.log(Tool.toolStrokeColorHex);
            paint.initColors();
        },
        handleMouseMove: function () {
            return;
        },
        handleMouseUp: function () {
            return;
        }
    };

    // Expose l'objet à l'exterieur du scope de la fonction.
    // Depuis l'extérieur, vous pouvez l'utilisé ainsi :
    // var monDestroyer = shipFactory.build(shipFactory.TYPE_DESTROYER)
    global.Tool = Tool;
    global.toolFactory = toolFactory;
    global.tools = tools;
}(this));
