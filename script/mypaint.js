/*jslint browser this for bitwise */
/*global alert $ Tool tools toolFactory */

(function () {
    "use strict";

    var paint = {

        // Le canvas et son context, qu'on va initialiser dans init()
        background: {
            id: "base",
            canvas: null,
            context: null,
            hidden: false,
            active: true
        },
        tmp: {
            canvas: null,
            context: null
        },
        canvasSize: {
            width: 640,
            height: 480
        },
        inputWidth: null,
        inputHeight: null,
        layers: [],
        currentTool: null,
        currentToolName: "pencil",

        init: function () {
            this.background.canvas = document.querySelector("#canvas-base");
            this.background.context = this.background.canvas.getContext("2d");

            this.tmp.canvas = document.querySelector("#canvas-tmp");
            this.tmp.context = this.tmp.canvas.getContext("2d");


            Tool.currentCanvas = this.background.cavas;
            Tool.currentContext = this.background.context;

            Tool.tmpCanvas = this.tmp.canvas;
            Tool.tmpContext = this.tmp.context;

            this.inputWidth = document.querySelector("#canvas-width");
            this.inputHeight = document.querySelector("#canvas-height");

            // On démarrer les listeners
            this.addListeners();

            this.initColors();

            this.setDimensions();

            this.setToolSize();

            this.generateToolsList();

            this.currentTool = toolFactory.new(this.currentToolName);
        },
        setDimensions: function () {
            // On définit la taille du holder
            var holder = document.querySelector(".big-canvas-holder");
            holder.style.width = this.canvasSize.width + "px";
            holder.style.height = this.canvasSize.height + "px";

            // On définit la taille interne du canvas
            this.background.context.canvas.width = this.canvasSize.width;
            this.background.context.canvas.height = this.canvasSize.height;
            this.tmp.context.canvas.width = this.canvasSize.width;
            this.tmp.context.canvas.height = this.canvasSize.height;

            // Ainsi que sa taille visuelle
            this.background.canvas.style.width = this.canvasSize.width + "px";
            this.background.canvas.style.height = this.canvasSize.height + "px";
            this.tmp.canvas.style.width = this.canvasSize.width + "px";
            this.tmp.canvas.style.height = this.canvasSize.height + "px";

            // On assigne ces dimensions aux values des inputs
            this.inputWidth.value = this.canvasSize.width;
            this.inputHeight.value = this.canvasSize.height;

            Tool.contextWidth = this.canvasSize.width;
            Tool.contextHeight = this.canvasSize.height;

            this.updateLayersList();
        },
        addListeners: function () {
            document.querySelector("#canvas-set-dimensions").addEventListener("click", this.resizeCanvas.bind(this));
            document.querySelector("#canvas-reset").addEventListener("click", this.resetCanvas.bind(this));
            document.querySelector("#canvas-reset-dimensions").addEventListener("click", this.resetSizeCanvas.bind(this));
            document.querySelector("#tool-thickness").addEventListener("input", this.setToolSize.bind(this));
            document.querySelector("#tool-color").addEventListener("input", this.updateColor.bind(this));
            document.querySelector("#new-layer").addEventListener("click", this.addLayer.bind(this));
            document.querySelector(".layers-list-holder").addEventListener("click", this.manipulateLayers.bind(this));
            document.querySelector("#tools-holder").addEventListener("click", this.setCurrentTool.bind(this));

            document.querySelector(".big-canvas-holder").addEventListener("mousedown", this.onMouseDown.bind(this));
            document.querySelector(".big-canvas-holder").addEventListener("mousemove", this.onMouseMove.bind(this));
            document.querySelector(".big-canvas-holder").addEventListener("mouseup", this.onMouseUp.bind(this));
        },
        onMouseDown: function (mouse) {
            // console.log("On mousedown" + mouse);
            this.currentTool = toolFactory.new(this.currentToolName);
            this.currentTool.handleMouseDown(mouse);
        },
        onMouseMove: function (mouse) {
            // console.log("On mousemove" + mouse);
            this.currentTool.handleMouseMove(mouse);
        },
        onMouseUp: function (mouse) {
            // console.log("On mouseup" + mouse);
            this.currentTool.handleMouseUp(mouse);
        },
        setCurrentTool: function (tools) {
            this.currentToolName = tools.target.getAttribute("attr-tool");
        },
        resizeCanvas: function () {
            // On vérifie que les inputs contiennent bien des int, sinon on assigne les valeurs par défaut
            var width = (isNaN(parseInt(this.inputWidth.value, 10)) || this.inputWidth.value < 1)
                ? this.canvasSize.width
                : this.inputWidth.value;
            var height = (isNaN(parseInt(this.inputHeight.value, 10)) || this.inputHeight.value < 1)
                ? this.canvasSize.height
                : this.inputHeight.value;

             // On assigne ces valeurs dans canvasSize
            this.canvasSize.width = width;
            this.canvasSize.height = height;

            // On reset les canvas, les layers etc
            this.resetCanvas();

            // On redimmensionne le canvas
            this.setDimensions();
        },
        resetSizeCanvas: function () {
            // On remet le canvas a sa taille par défaut
            this.canvasSize.width = 640;
            this.canvasSize.height = 480;
            this.setDimensions();
        },
        resetCanvas: function () {
            // On clear le canvas
            this.background.context.clearRect(0, 0, this.canvasSize.width, this.canvasSize.height);
            this.background.hidden = false;
            this.deleteAllLayers();
        },
        setToolSize: function () {
            // On récupère la value de l'input tool-thickness
            var inputThickness = document.querySelector("#tool-thickness");
            var thickness = (isNaN(parseInt(inputThickness.value, 10)) || inputThickness.value < 1)
                ? Tool.toolThickness
                : inputThickness.value;

            // On reaffiche la valeur au cas ou le gars a entré de la merde dans l'input
            inputThickness.value = thickness;
            // Et on modifie toolThickness en conséquence
            Tool.toolThickness = thickness;
        },
        generateToolsList: function () {
            var $toolsHolder = $("#tools-holder");
            var $tool;
            $.each(tools, function (tool) {
                $tool = $("<button class='" + tool + "' attr-tool='" + tool + "'>" + tool + "</button>");
                $tool.appendTo($toolsHolder);
            });
        },
        addLayer: function () {
            var nextLayer = this.getLastLayerId() + 1;

            var $holder = $(".canvas-holder");
            var layer = {};

            var $canva = $("<canvas></canvas>");
            $canva.addClass("canvas-layer");
            $canva.attr("id", "layer-" + nextLayer);
            $canva.css({
                width: this.canvasSize.width,
                height: this.canvasSize.height,
                "z-index": nextLayer
            });
            $canva.appendTo($holder);

            var canva = document.querySelector("#layer-" + nextLayer);
            var context = canva.getContext("2d");

            context.canvas.width = this.canvasSize.width;
            context.canvas.height = this.canvasSize.height;

            layer.id = nextLayer;
            layer.canva = canva;
            layer.context = context;
            layer.hidden = false;
            layer.active = false;
            layer.order = nextLayer;

            this.layers.push(layer);

            this.recalculateOrder();
            this.updateLayersList();
        },
        updateLayersList: function () {
            var $layersListHolder = $(".layers-list-holder");
            var $layersList = $("<ul class='layer-list'></ul>");
            var $layer;
            var $hidden;
            var $delete;
            var $up;
            var $down;
            var $active;

            $layersListHolder.empty();

            var $base = $("<p class='base'>Background</p>");
            $hidden = this.background.hidden === false
                ? $("<input type='checkbox' class='background-hide' attr-num='" + this.background.id + "' checked>")
                : $("<input type='checkbox' class='background-hide' attr-num='" + this.background.id + "'>");
            $hidden.appendTo($base);

            $active = this.background.active === true
                ? $("<input type='checkbox' class='background-active' attr-num='" + this.background.id + "' checked>")
                : $("<input type='checkbox' class='background-active' attr-num='" + this.background.id + "'>");
            $active.appendTo($base);

            $base.appendTo($layersListHolder);

            var layersForDisplay = JSON.parse(JSON.stringify(this.layers));
            layersForDisplay.sort(this.comparator);

            layersForDisplay.forEach(function (layer) {
                $layer = $("<li class='layer-li'>Calque " + layer.id + "</li>");

                $hidden = layer.hidden === false
                    ? $("<input type='checkbox' class='layer-hide' attr-num='" + layer.id + "' checked>")
                    : $("<input type='checkbox' class='layer-hide' attr-num='" + layer.id + "'>");
                $hidden.appendTo($layer);

                $active = layer.active === true
                    ? $("<input type='checkbox' class='layer-active' attr-num='" + layer.id + "' checked>")
                    : $("<input type='checkbox' class='layer-active' attr-num='" + layer.id + "'>");
                $active.appendTo($layer);

                $up = $("<button class='layer-up' attr-num='" + layer.id + "'>Up</button>");
                $up.appendTo($layer);

                $down = $("<button class='layer-down' attr-num='" + layer.id + "'>Down</button>");
                $down.appendTo($layer);

                $delete = $("<button class='layer-delete' attr-num='" + layer.id + "'>Supprimer</button>");
                $delete.appendTo($layer);

                $layer.appendTo($layersList);
            });

            $layersList.appendTo($layersListHolder);
        },
        toggleLayer: function (layer, $layer) {
            if (false === $layer.hasClass("hidden")) {
                $layer.addClass("hidden");
                layer.hidden = true;
            } else {
                $layer.removeClass("hidden");
                layer.hidden = false;
            }
        },
        toggleBackground: function () {
            var $bg = $("#canvas-base");
            if (false === $bg.hasClass("hidden")) {
                $bg.addClass("hidden");
                this.background.hidden = true;
            } else {
                $bg.removeClass("hidden");
                this.background.hidden = false;
            }
        },
        updateCurrentLayer: function () {
            var i = this.layers.length;
            var again = true;

            while (true === again) {
                if (undefined === this.layers[i] || this.layers[i].hidden === false) {
                    Tool.currentContext = i;
                    again = false;
                }
                i -= 1;
            }
        },
        deleteLayer: function (layer, $layer) {
            var index = this.layers.indexOf(layer);
            this.layers.splice(index, 1);

            $layer.remove();

            this.verifyCurrentLayer(layer);
        },
        deleteAllLayers: function () {
            var i;
            var $layer;

            for (i = this.layers.length - 1; i >= 0; i -= 1) {
                $layer = $(this.layers[i].canva);
                this.deleteLayer(this.layers[i], $layer, this.layers[i].id);
            }

            this.updateLayersList();
        },
        getLastLayerId: function () {
            var i = this.layers.length - 1;
            var id;
            if (undefined !== this.layers[i]) {
                id = this.layers[i].id;
            } else {
                id = 0;
            }

            return id;
        },
        manipulateLayers: function (e) {
            var num = parseInt(e.target.getAttribute("attr-num"));
            var layer = this.grepOne(this.layers, "id", num);
            var $layer = $("#layer-" + num);

            switch (e.target.className) {
            case "layer-hide":
                this.toggleLayer(layer, $layer);
                break;
            case "layer-delete":
                this.deleteLayer(layer, $layer);
                break;
            case "layer-up":
                this.moveLayerUp(layer, $layer);
                break;
            case "layer-down":
                this.moveLayerDown(layer, $layer);
                break;
            case "layer-active":
                this.activateLayer(layer);
                break;
            case "background-hide":
                this.toggleBackground();
                break;
            case "background-active":
                this.activateBackground();
                break;
            }

            this.recalculateOrder();
            this.updateLayersList();
        },
        activateBackground: function () {
            var $tmpCanvas = $(this.tmp.canvas);

            this.layers.forEach(function (otherLayer) {
                otherLayer.active = false;
            });
            this.background.active = true;
            $tmpCanvas.css({"z-index": 0});

            Tool.currentCanvas = this.background.canvas;
            Tool.currentContext = this.background.context;
        },
        activateLayer: function (layer) {
            var $tmpCanvas = $(this.tmp.canvas);

            this.layers.forEach(function (otherLayer) {
                otherLayer.active = false;
            });
            this.background.active = false;

            layer.active = true;
            $tmpCanvas.css({"z-index": layer.order});

            Tool.currentCanvas = layer.canvas;
            Tool.currentContext = layer.context;
        },
        verifyCurrentLayer: function (layer) {
            var $tmpCanvas = $(this.tmp.canvas);

            var layersForDisplay = JSON.parse(JSON.stringify(this.layers));
            layersForDisplay.sort(this.comparator);
            var lastLayer = layersForDisplay.length >= 1
                ? layersForDisplay[layersForDisplay.length - 1]
                : null;

            if (layer.active === true) {
                if (lastLayer === null) {
                    this.background.active = true;
                    Tool.currentCanvas = this.background.canvas;
                    Tool.currentContext = this.background.context;
                    $tmpCanvas.css({"z-index": 0});
                } else {
                    var layerToActivate = this.grepOne(this.layers, "id", lastLayer.id);
                    layerToActivate.active = true;
                    Tool.currentCanvas = layerToActivate.canvas;
                    Tool.currentContext = layerToActivate.context;
                    $tmpCanvas.css({"z-index": layerToActivate.order});
                }
            }
        },
        recalculateOrder: function () {
            var self = this;
            var layersForDisplay = JSON.parse(JSON.stringify(this.layers));
            layersForDisplay.sort(this.comparator);
            layersForDisplay.forEach(function (layer) {
                var layer2 = self.grepOne(self.layers, "id", layer.id);
                layer2.order = layersForDisplay.indexOf(layer) + 1;
            });
        },
        moveLayerUp: function (layer, $layer) {
            if (layer.order === 1) {
                return false;
            }

            var previousLayer = this.grepOne(this.layers, "order", layer.order - 1);
            var $previousLayer = $(previousLayer.canva);

            layer.order = layer.order - 1;
            previousLayer.order = previousLayer.order + 1;

            $layer.css({"z-index": layer.order});
            $previousLayer.css({"z-index": previousLayer.order});
        },
        moveLayerDown: function (layer, $layer) {
            if (layer.order === this.layers.length) {
                return false;
            }

            var nextLayer = this.grepOne(this.layers, "order", layer.order + 1);
            var $nextLayer = $(nextLayer.canva);

            layer.order = layer.order + 1;
            nextLayer.order = nextLayer.order - 1;

            $layer.css({"z-index": layer.order});
            $nextLayer.css({"z-index": nextLayer.order});
        },
        grepOne: function (where, attr, value) {
            var res = $.grep(where, function (e) {
                return e[attr] === parseInt(value);
            });
            if (res.length > 0) {
                return res[0];
            } else {
                return false;
            }
        },
        comparator: function (a, b) {
            return parseInt(a.order, 10) - parseInt(b.order, 10);
        },
        initColors: function () {
            // On set la value de l'input Hexa
            var inputHexa = document.querySelector(".color-hexa");
            inputHexa.value = Tool.toolColorHex;

            // On converti l'hexa en RGB
            Tool.toolColorRGB = this.hexToRGB(Tool.toolColorHex);

            // On récupère les inputs RGB et on leur asigne les valeurs RGB
            var inputsRGB = document.getElementsByClassName("color-rgb");
            inputsRGB[0].value = Tool.toolColorRGB.r;
            inputsRGB[1].value = Tool.toolColorRGB.g;
            inputsRGB[2].value = Tool.toolColorRGB.b;

            // On converti le RGB en HSL
            Tool.toolColorHSL = this.rgbToHSL(Tool.toolColorRGB);

            // On récupère les inputs RGB et on leur asigne les valeurs RGB
            var inputsHSL = document.getElementsByClassName("color-hsl");
            inputsHSL[0].value = Tool.toolColorHSL.h;
            inputsHSL[1].value = Tool.toolColorHSL.s;
            inputsHSL[2].value = Tool.toolColorHSL.l;
        },
        updateColor: function (e) {
            switch (e.target.className) {
            case "color-hexa":
                this.updateFromHex();
                break;
            case "color-rgb":
                this.updateFromRGB();
                break;
            case "color-hsl":
                this.updateFromHSL();
                break;
            }
        },
        updateFromHex: function () {
            var inputHexa = document.querySelector(".color-hexa");
            Tool.toolColorHex = inputHexa.value;
            this.initColors();
        },
        updateFromRGB: function () {
            var val;
            var tmp;

            // Petit each jQuery, la facilité !
            $.each(Tool.toolColorRGB, function (index, value) {
                tmp = document.querySelector("#color-" + index).value;
                val = (tmp > 255 || tmp < 0)
                    ? value
                    : tmp;

                Tool.toolColorRGB[index] = val;
            });

            Tool.toolColorHex = this.rgbToHex(Tool.toolColorRGB);
            this.initColors();
        },
        updateFromHSL: function () {
            var val;
            var tmp;

            // Petit each jQuery, la facilité !
            $.each(Tool.toolColorHSL, function (index, value) {
                tmp = document.querySelector("#color-" + index).value;
                if (index === "h") {
                    val = (tmp > 359 || tmp < 0)
                        ? value
                        : tmp;
                } else {
                    val = (tmp > 100 || tmp < 0)
                        ? value
                        : tmp;
                }

                Tool.toolColorHSL[index] = val;
            });

            Tool.toolColorRGB = this.hslToRGB(Tool.toolColorHSL);
            Tool.toolColorHex = this.rgbToHex(Tool.toolColorRGB);
            this.initColors();
        },
        hexToRGB: function (hex) {
            // On retire le hash et on converti le code hexa en base16
            hex = parseInt(hex.substr(1, hex.length - 1), 16);

            var RGB = {};
            // On genere les 3 composantes grace aux opéraions bit à bit
            RGB.r = hex >> 16;
            RGB.g = hex >> 8 & 0xFF;
            RGB.b = hex & 0xFF;
            return RGB;
        },
        rgbToHex: function (rgb) {
            var bin = rgb.r << 16 | rgb.g << 8 | rgb.b;

            return "#" + bin.toString(16);
        },
        rgbToHSL: function (rgb) {
            var rgb2 = {};
            var hsl = {};
            var difference;

            rgb2.r = this.toPercent(parseInt(rgb.r, 10) % 256, 256);
            rgb2.g = this.toPercent(parseInt(rgb.g, 10) % 256, 256);
            rgb2.b = this.toPercent(parseInt(rgb.b, 10) % 256, 256);

            var max = Math.max(rgb2.r, rgb2.g, rgb2.b);
            var min = Math.min(rgb2.r, rgb2.g, rgb2.b);

            hsl.l = (max + min) / 2;
            if (max === min) {
                hsl.h = 0;
                hsl.s = 0;
            } else {
                difference = max - min;
                hsl.s = hsl.l > 0.5
                    ? difference / (2 - max - min)
                    : difference / (max + min);

                switch (max) {
                case rgb2.r:
                    hsl.h = (rgb2.g - rgb2.b) / difference + (rgb2.g < rgb2.b
                        ? 6
                        : 0);
                    break;
                case rgb2.g:
                    hsl.h = (rgb2.b - rgb2.r) / difference + 2;
                    break;
                case rgb2.b:
                    hsl.h = (rgb2.r - rgb2.g) / difference + 4;
                    break;
                }
                hsl.h /= 6;
            }
            hsl.h = parseInt((hsl.h * 360).toFixed(0), 10);
            hsl.s = parseInt((hsl.s * 100).toFixed(0), 10);
            hsl.l = parseInt((hsl.l * 100).toFixed(0), 10);

            return hsl;
        },
        hslToRGB: function (hsl) {
            var rgb = {};
            var h = hsl.h;
            var s = hsl.s;
            var l = hsl.l;
            var m;
            var c;
            var x;

            h /= 60;
            if (h < 0) {
                h = 6 - (-h % 6);
            }
            h %= 6;

            s = Math.max(0, Math.min(1, s / 100));
            l = Math.max(0, Math.min(1, l / 100));

            c = (1 - Math.abs((2 * l) - 1)) * s;
            x = c * (1 - Math.abs((h % 2) - 1));

            if (h < 1) {
                rgb.r = c;
                rgb.g = x;
                rgb.b = 0;
            } else if (h < 2) {
                rgb.r = x;
                rgb.g = c;
                rgb.b = 0;
            } else if (h < 3) {
                rgb.r = 0;
                rgb.g = c;
                rgb.b = x;
            } else if (h < 4) {
                rgb.r = 0;
                rgb.g = x;
                rgb.b = c;
            } else if (h < 5) {
                rgb.r = x;
                rgb.g = 0;
                rgb.b = c;
            } else {
                rgb.r = c;
                rgb.g = 0;
                rgb.b = x;
            }

            m = l - c / 2;
            rgb.r = Math.round((rgb.r + m) * 255);
            rgb.g = Math.round((rgb.g + m) * 255);
            rgb.b = Math.round((rgb.b + m) * 255);

            return rgb;
        },
        toPercent: function (amount, limit) {
            return amount / limit;
        }
    };

    document.addEventListener("DOMContentLoaded", function () {
        paint.init();
    });

}());