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
        originSym: {
            x: null,
            y: null
        },
        destinationSym: {
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
        },
        calculateSymOrigin: function (x, y) {
            this.calculateSymPos(x, y);
            this.originSym.x = this.symPos.x;
            this.originSym.y = this.symPos.y;
        },
        drawSymetrie: function () {
            this.currLayer.context.drawImage(this.symLayer.canvas, 0, 0);
            this.clearContext(this.symLayer.context);
        },
        draw: function () {
            this.click1 = false;
            this.currLayer.context.drawImage(this.tmpLayer.canvas, 0, 0);
            this.clearContext(this.tmpLayer.context);
        },
        setContextOptions: function (context) {
            context.lineCap = this.toolEnd;
            context.lineJoin = "round";
            context.strokeStyle = this.toolStrokeColorHex;
            context.fillStyle = this.toolFillColorHex;
            context.lineWidth = this.toolThickness;
        },
        clearContext: function (context) {
            context.clearRect(0, 0, this.contextWidth, this.contextHeight);
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
        handleMouseDown: function (coords) {
            this.click1 = true;
            this.currLayer.context.beginPath();
            this.currLayer.context.moveTo(coords.x, coords.y);

            // Symétrie
            if (this.symHorizontal === true || this.symVertical === true) {
                this.calculateSymPos(coords.x, coords.y);
                this.symLayer.context.beginPath();
                this.symLayer.context.moveTo(this.symPos.x, this.symPos.y);
            }
        },
        handleMouseMove: function (coords) {
            if (this.click1 === true) {
                this.destination.x = coords.x;
                this.destination.y = coords.y;

                this.setContextOptions(this.currLayer.context);
                this.currLayer.context.lineTo(this.destination.x, this.destination.y);
                this.currLayer.context.stroke();

                // Symétrie
                if (this.symHorizontal === true || this.symVertical === true) {
                    this.calculateSymPos(coords.x, coords.y);
                    this.setContextOptions(this.symLayer.context);
                    this.symLayer.context.lineTo(this.symPos.x, this.symPos.y);
                    this.symLayer.context.stroke();
                }
            }
        },
        handleMouseUp: function () {
            this.click1 = false;

            // Symétrie
            if (this.symHorizontal === true || this.symVertical === true) {
                this.drawSymetrie();
            }
        }
    };
    tools.eraser = {
        handleMouseDown: function (coords) {
            this.click1 = true;
            this.currLayer.context.beginPath();
            this.currLayer.context.moveTo(coords.x, coords.y);

            // Symétrie
            if (this.symHorizontal === true || this.symVertical === true) {
                this.calculateSymPos(coords.x, coords.y);
                this.symLayer.context.beginPath();
                this.symLayer.context.moveTo(this.symPos.x, this.symPos.y);
                this.tmpLayer.context.drawImage(this.currLayer.canvas, 0, 0);

                if (this.symHorizontal === true) {
                    this.symLayer.context.drawImage(this.currLayer.canvas, this.contextWidth / 2, 0, this.contextWidth / 2, this.contextHeight, this.contextWidth / 2, 0, this.contextWidth / 2, this.contextHeight);
                    this.clearContext(this.currLayer.context);
                    this.currLayer.context.drawImage(this.tmpLayer.canvas, 0, 0, this.contextWidth / 2, this.contextHeight, 0, 0, this.contextWidth / 2, this.contextHeight);
                } else if (this.symVertical === true) {
                    this.symLayer.context.drawImage(this.currLayer.canvas, 0, this.contextHeight / 2, this.contextWidth, this.contextHeight / 2, 0, this.contextHeight / 2, this.contextWidth, this.contextHeight / 2);
                    this.clearContext(this.currLayer.context);
                    this.currLayer.context.drawImage(this.tmpLayer.canvas, 0, 0, this.contextWidth, this.contextHeight / 2, 0, 0, this.contextWidth, this.contextHeight / 2);
                }
                this.clearContext(this.tmpLayer.context);
            }
        },
        handleMouseMove: function (coords) {
            if (this.click1 === true) {
                this.currLayer.context.globalCompositeOperation = "destination-out";
                this.setContextOptions(this.currLayer.context);
                this.currLayer.context.lineTo(coords.x, coords.y);
                this.currLayer.context.stroke();

                // Symétrie
                if (this.symHorizontal === true || this.symVertical === true) {
                    this.calculateSymPos(coords.x, coords.y);
                    this.symLayer.context.globalCompositeOperation = "destination-out";
                    this.setContextOptions(this.symLayer.context);
                    this.symLayer.context.lineTo(this.symPos.x, this.symPos.y);
                    this.symLayer.context.stroke();
                }
            }
        },
        handleMouseUp: function () {
            this.click1 = false;
            this.currLayer.context.globalCompositeOperation = "source-over";

            // Symétrie
            if (this.symHorizontal === true || this.symVertical === true) {
                this.symLayer.context.globalCompositeOperation = "source-over";
                this.drawSymetrie();
            }
        }
    };
    tools.rectangle = {
        handleMouseDown: function (coords) {
            this.click1 = true;
            this.origin.x = coords.x;
            this.origin.y = coords.y;

            // Symétrie
            if (this.symHorizontal === true || this.symVertical === true) {
                this.calculateSymOrigin(coords.x, coords.y);
            }
        },
        handleMouseMove: function (coords) {
            if (this.click1 === true) {
                this.tmpLayer.context.beginPath();

                this.clearContext(this.tmpLayer.context);

                var dist = {
                    x: coords.x - this.origin.x,
                    y: coords.y - this.origin.y
                };

                this.setContextOptions(this.tmpLayer.context);

                this.tmpLayer.context.rect(this.origin.x, this.origin.y, dist.x, dist.y);
                if (this.toolFill === true) {
                    this.tmpLayer.context.fill();
                }
                this.tmpLayer.context.stroke();
                this.tmpLayer.context.closePath();

                // Symétrie
                if (this.symHorizontal === true || this.symVertical === true) {
                    this.symLayer.context.beginPath();
                    this.clearContext(this.symLayer.context);

                    this.calculateSymPos(coords.x, coords.y);
                    dist.x = this.symPos.x - this.originSym.x;
                    dist.y = this.symPos.y - this.originSym.y;

                    this.setContextOptions(this.symLayer.context);

                    this.symLayer.context.rect(this.originSym.x, this.originSym.y, dist.x, dist.y);
                    if (this.toolFill === true) {
                        this.symLayer.context.fill();
                    }

                    this.symLayer.context.stroke();
                    this.symLayer.context.closePath();
                }
            }
        },
        handleMouseUp: function () {
            this.draw();
            // Symétrie
            if (this.symHorizontal === true || this.symVertical === true) {
                this.drawSymetrie();
            }
        }
    };
    tools.circle = {
        handleMouseDown: function (coords) {
            this.click1 = true;
            this.origin.x = coords.x;
            this.origin.y = coords.y;

            // Symétrie
            if (this.symHorizontal === true || this.symVertical === true) {
                this.calculateSymOrigin(coords.x, coords.y);
            }
        },
        handleMouseMove: function (coords) {
            if (this.click1 === true) {
                this.tmpLayer.context.beginPath();

                this.clearContext(this.tmpLayer.context);

                var dist = {
                    x: coords.x - this.origin.x,
                    y: coords.y - this.origin.y
                };
                var radius = Math.sqrt(Math.pow(dist.x, 2) + Math.pow(dist.y, 2));

                this.setContextOptions(this.tmpLayer.context);
                this.tmpLayer.context.arc(this.origin.x, this.origin.y, radius, 0, Math.PI * 2);

                if (this.toolFill === true) {
                    this.tmpLayer.context.fill();
                }
                this.tmpLayer.context.stroke();
                this.tmpLayer.context.closePath();

                // Symétrie
                if (this.symHorizontal === true || this.symVertical === true) {
                    this.symLayer.context.beginPath();
                    this.clearContext(this.symLayer.context);

                    this.calculateSymPos(coords.x, coords.y);
                    dist.x = this.symPos.x - this.originSym.x;
                    dist.y = this.symPos.y - this.originSym.y;
                    radius = Math.sqrt(Math.pow(dist.x, 2) + Math.pow(dist.y, 2));


                    this.setContextOptions(this.symLayer.context);
                    this.symLayer.context.arc(this.originSym.x, this.originSym.y, radius, 0, Math.PI * 2);
                    if (this.toolFill === true) {
                        this.symLayer.context.fill();
                    }

                    this.symLayer.context.stroke();
                    this.symLayer.context.closePath();
                }
            }
        },
        handleMouseUp: function () {
            this.draw();
            // Symétrie
            if (this.symHorizontal === true || this.symVertical === true) {
                this.drawSymetrie();
            }
        }
    };
    tools.line = {
        handleMouseDown: function (coords) {
            this.click1 = true;
            this.origin.x = coords.x;
            this.origin.y = coords.y;

            // Symétrie
            if (this.symHorizontal === true || this.symVertical === true) {
                this.calculateSymOrigin(coords.x, coords.y);
            }
        },
        handleMouseMove: function (coords) {
            if (this.click1 === true) {
                this.tmpLayer.context.beginPath();
                this.tmpLayer.context.moveTo(this.origin.x, this.origin.y);
                this.clearContext(this.tmpLayer.context);

                this.setContextOptions(this.tmpLayer.context);

                this.tmpLayer.context.lineTo(coords.x, coords.y);
                this.tmpLayer.context.stroke();
                this.tmpLayer.context.closePath();

                // Symétrie
                if (this.symHorizontal === true || this.symVertical === true) {
                    this.symLayer.context.beginPath();
                    this.symLayer.context.moveTo(this.originSym.x, this.originSym.y);
                    this.clearContext(this.symLayer.context);

                    this.setContextOptions(this.symLayer.context);

                    this.calculateSymPos(coords.x, coords.y);
                    this.symLayer.context.lineTo(this.symPos.x, this.symPos.y);
                    this.symLayer.context.stroke();
                    this.symLayer.context.closePath();
                }

            }
        },
        handleMouseUp: function () {
            this.draw();
            // Symétrie
            if (this.symHorizontal === true || this.symVertical === true) {
                this.drawSymetrie();
            }
        }
    };
    tools.eyedropper = {
        handleMouseDown: function (coords) {
            this.origin.x = coords.x;
            this.origin.y = coords.y;

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
