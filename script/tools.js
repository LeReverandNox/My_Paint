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
        currLayer: {
            canvas: null,
            context: null
        },
        tmpLayer: {
            canvas: null,
            context: null
        },
        symLayer: {
            canvas: null,
            context: null
        },
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
        },
        symHorizontal: false,
        symVertical: false,
        symPos: {
            x: null,
            y: null
        },
        calculateSymPos: function (x, y) {
            if (this.symHorizontal === true) {
                this.symPos.x = this.contextWidth - x;
                this.symPos.y = y;

                if (this.symVertical === true) {
                    this.symPos.y = this.contextHeight - y;
                }
            } else if (this.symVertical === true) {
                this.symPos.x = x;
                this.symPos.y = this.contextHeight - y;
            }
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
            this.currLayer.context.beginPath();
            this.currLayer.context.moveTo(mouse.layerX, mouse.layerY);

            if (this.symHorizontal === true || this.symVertical === true) {
                this.calculateSymPos(mouse.layerX, mouse.layerY);
                this.symLayer.context.beginPath();
                this.symLayer.context.moveTo(this.symPos.x, this.symPos.y);
            }
        },
        handleMouseMove: function (mouse) {
            if (this.click1 === true) {
                this.destination.x = mouse.layerX;
                this.destination.y = mouse.layerY;

                this.currLayer.context.lineCap = this.toolEnd;
                this.currLayer.context.lineTo(this.destination.x, this.destination.y);
                this.currLayer.context.strokeStyle = this.toolStrokeColorHex;
                this.currLayer.context.lineWidth = this.toolThickness;
                this.currLayer.context.stroke();

                if (this.symHorizontal === true || this.symVertical === true) {
                    this.calculateSymPos(mouse.layerX, mouse.layerY);
                    this.symLayer.context.lineCap = this.toolEnd;
                    this.symLayer.context.strokeStyle = this.toolStrokeColorHex;
                    this.symLayer.context.lineWidth = this.toolThickness;
                    this.symLayer.context.lineTo(this.symPos.x, this.symPos.y);
                    this.symLayer.context.stroke();
                }
            }
        },
        handleMouseUp: function () {
            this.click1 = false;
            if (this.symHorizontal === true || this.symVertical === true) {
                this.currLayer.context.drawImage(this.symLayer.canvas, 0, 0);
                this.symLayer.context.clearRect(0, 0, this.contextWidth, this.contextHeight);
            }
        }
    };
    tools.eraser = {
        handleMouseDown: function (mouse) {
            this.click1 = true;
            this.currLayer.context.beginPath();
            this.currLayer.context.moveTo(mouse.layerX, mouse.layerY);

            if (this.symHorizontal === true || this.symVertical === true) {
                this.calculateSymPos(mouse.layerX, mouse.layerY);
                this.symLayer.context.beginPath();
                this.symLayer.context.moveTo(this.symPos.x, this.symPos.y);
                this.tmpLayer.context.drawImage(this.currLayer.canvas, 0, 0);

                if (this.symHorizontal === true) {
                    this.symLayer.context.drawImage(this.currLayer.canvas, this.contextWidth / 2, 0, this.contextWidth / 2, this.contextHeight, this.contextWidth / 2, 0, this.contextWidth / 2, this.contextHeight);
                    this.currLayer.context.clearRect(0, 0, this.contextWidth, this.contextHeight);
                    this.currLayer.context.drawImage(this.tmpLayer.canvas, 0, 0, this.contextWidth / 2, this.contextHeight, 0, 0, this.contextWidth / 2, this.contextHeight);
                } else if (this.symVertical === true) {
                    this.symLayer.context.drawImage(this.currLayer.canvas, 0, this.contextHeight / 2, this.contextWidth, this.contextHeight / 2, 0, this.contextHeight / 2, this.contextWidth, this.contextHeight / 2);
                    this.currLayer.context.clearRect(0, 0, this.contextWidth, this.contextHeight);
                    this.currLayer.context.drawImage(this.tmpLayer.canvas, 0, 0, this.contextWidth, this.contextHeight / 2, 0, 0, this.contextWidth, this.contextHeight / 2);
                }
                this.tmpLayer.context.clearRect(0, 0, this.contextWidth, this.contextHeight);
            }
        },
        handleMouseMove: function (mouse) {
            if (this.click1 === true) {
                this.destination.x = mouse.layerX;
                this.destination.y = mouse.layerY;

                this.currLayer.context.globalCompositeOperation = "destination-out";
                this.currLayer.context.lineCap = this.toolEnd;
                this.currLayer.context.lineTo(this.destination.x, this.destination.y);
                this.currLayer.context.strokeStyle = this.toolStrokeColorHex;
                this.currLayer.context.lineWidth = this.toolThickness;
                this.currLayer.context.stroke();

                if (this.symHorizontal === true || this.symVertical === true) {
                    this.calculateSymPos(mouse.layerX, mouse.layerY);
                    this.symLayer.context.globalCompositeOperation = "destination-out";
                    this.symLayer.context.lineCap = this.toolEnd;
                    this.symLayer.context.strokeStyle = this.toolStrokeColorHex;
                    this.symLayer.context.lineWidth = this.toolThickness;
                    this.symLayer.context.lineTo(this.symPos.x, this.symPos.y);
                    this.symLayer.context.stroke();
                }
            }
        },
        handleMouseUp: function () {
            this.click1 = false;
            this.currLayer.context.globalCompositeOperation = "source-over";

            if (this.symHorizontal === true || this.symVertical === true) {
                this.symLayer.context.globalCompositeOperation = "source-over";
                this.currLayer.context.drawImage(this.symLayer.canvas, 0, 0);
                this.symLayer.context.clearRect(0, 0, this.contextWidth, this.contextHeight);
            }
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
                this.tmpLayer.context.beginPath();

                this.tmpLayer.context.clearRect(0, 0, this.contextWidth, this.contextHeight);

                var dist = {
                    x: mouse.layerX - this.origin.x,
                    y: mouse.layerY - this.origin.y
                };


                this.tmpLayer.context.lineCap = this.toolEnd;
                this.tmpLayer.context.strokeStyle = this.toolStrokeColorHex;
                this.tmpLayer.context.lineWidth = this.toolThickness;

                this.tmpLayer.context.rect(this.origin.x, this.origin.y, dist.x, dist.y);
                if (this.toolFill === true) {
                    this.tmpLayer.context.fillStyle = this.toolFillColorHex;
                    this.tmpLayer.context.fill();
                }
                this.tmpLayer.context.stroke();
                this.tmpLayer.context.closePath();
            }
        },
        handleMouseUp: function () {
            this.click1 = false;
            this.currLayer.context.drawImage(this.tmpLayer.canvas, 0, 0);
            this.tmpLayer.context.clearRect(0, 0, this.contextWidth, this.contextHeight);

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
                this.tmpLayer.context.beginPath();

                this.tmpLayer.context.clearRect(0, 0, this.contextWidth, this.contextHeight);

                var dist = {
                    x: mouse.layerX - this.origin.x,
                    y: mouse.layerY - this.origin.y
                };
                var radius = Math.sqrt(Math.pow(dist.x, 2) + Math.pow(dist.y, 2));

                this.tmpLayer.context.lineCap = this.toolEnd;
                this.tmpLayer.context.strokeStyle = this.toolStrokeColorHex;
                this.tmpLayer.context.lineWidth = this.toolThickness;
                this.tmpLayer.context.arc(this.origin.x, this.origin.y, radius, 0, Math.PI * 2);

                if (this.toolFill === true) {
                    this.tmpLayer.context.fillStyle = this.toolFillColorHex;
                    this.tmpLayer.context.fill();
                }
                this.tmpLayer.context.stroke();
                this.tmpLayer.context.closePath();
            }
        },
        handleMouseUp: function () {
            this.click1 = false;
            this.currLayer.context.drawImage(this.tmpLayer.canvas, 0, 0);
            this.tmpLayer.context.clearRect(0, 0, this.contextWidth, this.contextHeight);
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
                this.tmpLayer.context.beginPath();

                this.tmpLayer.context.moveTo(this.origin.x, this.origin.y);

                this.tmpLayer.context.clearRect(0, 0, this.contextWidth, this.contextHeight);

                this.tmpLayer.context.lineCap = this.toolEnd;
                this.tmpLayer.context.strokeStyle = this.toolStrokeColorHex;
                this.tmpLayer.context.lineWidth = this.toolThickness;

                this.tmpLayer.context.lineTo(mouse.layerX, mouse.layerY);

                this.tmpLayer.context.stroke();
                this.tmpLayer.context.fill();

                this.tmpLayer.context.closePath();
            }
        },
        handleMouseUp: function () {
            this.click1 = false;
            this.currLayer.context.drawImage(this.tmpLayer.canvas, 0, 0);
            this.tmpLayer.context.clearRect(0, 0, this.contextWidth, this.contextHeight);
        }
    };
    tools.eyedropper = {
        handleMouseDown: function (mouse) {
            this.origin.x = mouse.layerX;
            this.origin.y = mouse.layerY;

            var arrRgb = this.currLayer.context.getImageData(this.origin.x, this.origin.y, 1, 1).data;
            var rgb = {
                r: arrRgb[0],
                g: arrRgb[1],
                b: arrRgb[2]
            };

            Tool.toolStrokeColorHex = paint.rgbToHex(rgb);
            Tool.toolFillColorHex = paint.rgbToHex(rgb);
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
