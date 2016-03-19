/*jslint browser this */
/*global _, utils */

(function (global) {
    "use strict";

    var tools = {
        pencil: null
    };

    var Tool = {
        currentContext: null,
        toolThickness: 10,
        toolEnd: "round",
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
        click2: false
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
                this.currentContext.lineCap = this.toolEnd;
                this.currentContext.lineTo(mouse.layerX, mouse.layerY);
                this.currentContext.strokeStyle = this.toolColorHex;
                this.currentContext.lineWidth = this.toolThickness;
                this.currentContext.stroke();
            }
        },
        handleMouseUp: function (mouse) {
            this.click1 = false;
        }
    };

    // Expose l'objet à l'exterieur du scope de la fonction.
    // Depuis l'extérieur, vous pouvez l'utilisé ainsi :
    // var monDestroyer = shipFactory.build(shipFactory.TYPE_DESTROYER)
    global.Tool = Tool;
    global.toolFactory = toolFactory;
}(this));
