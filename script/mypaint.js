/*jslint browser this */
/*global alert $ */

(function () {
    "use strict";

    var paint = {

        // Le canvas et son context, qu'on va initialiser dans init()
        canvas: null,
        context: null,
        canvasSize: {
            width: 640,
            height: 480
        },
        inputWidth: null,
        inputHeight: null,
        toolThickness: 5,
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
        layers: [],
        currentLayer: 0,

        init: function () {
            this.canvas = document.querySelector("#canvas-base");
            this.context = this.canvas.getContext("2d");

            this.inputWidth = document.querySelector("#canvas-width");
            this.inputHeight = document.querySelector("#canvas-height");

            // On démarrer les listeners
            this.addListeners();

            this.initColors();

            this.setDimensions();

        },
        setDimensions: function () {
            // On définit la taille du holder
            var holder = document.querySelector(".canvas-holder");
            holder.style.width = this.canvasSize.width + "px";
            holder.style.height = this.canvasSize.height + "px";

            // On définit la taille interne du canvas
            this.context.width = this.canvasSize.width;
            this.context.height = this.canvasSize.height;

            // Ainsi que sa taille visuelle
            this.canvas.style.width = this.canvasSize.width + "px";
            this.canvas.style.height = this.canvasSize.height + "px";

            // On assigne ces dimensions aux values des inputs
            this.inputWidth.value = this.canvasSize.width;
            this.inputHeight.value = this.canvasSize.height;
        },
        addListeners: function () {
            document.querySelector("#canvas-set-dimensions").addEventListener("click", this.resizeCanvas.bind(this));
            document.querySelector("#canvas-reset").addEventListener("click", this.resetCanvas.bind(this));
            document.querySelector("#canvas-reset-dimensions").addEventListener("click", this.resetSizeCanvas.bind(this));
            document.querySelector("#tool-thickness").addEventListener("input", this.setToolSize.bind(this));
            document.querySelector("#tool-color").addEventListener("input", this.updateColor.bind(this));
            document.querySelector("#new-layer").addEventListener("click", this.addLayer.bind(this));
            // document.querySelector(".layer-list").addEventListener("click", test(this, self));
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
            this.context.clearRect(0, 0, this.canvasSize.width, this.canvasSize.height);
            this.deleteAllLayers();
        },
        setToolSize: function () {
            // On récupère la value de l'input tool-thickness
            var inputThickness = document.querySelector("#tool-thickness");
            var thickness = (isNaN(parseInt(inputThickness.value, 10)) || inputThickness.value < 1)
                ? this.toolThickness
                : inputThickness.value;

            // On reaffiche la valeur au cas ou le gars a entré de la merde dans l'input
            inputThickness.value = thickness;
            // Et on modifie toolThickness en conséquence
            this.toolThickness = thickness;
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
                height: this.canvasSize.height
            });
            $canva.appendTo($holder);

            var canva = document.querySelector("#layer-" + nextLayer);
            var context = canva.getContext("2d");

            context.width = this.canvasSize.width;
            context.height = this.canvasSize.height;

            // context.beginPath();
            // context.moveTo(nextLayer * 5, 5);
            // context.lineTo(nextLayer * 5, 50);
            // context.strokeStyle = this.toolColorHex;
            // context.lineWidth = this.toolThickness;
            // context.stroke();

            layer.id = nextLayer;
            layer.canva = canva;
            layer.context = context;
            layer.hidden = false;

            this.layers.push(layer);

            this.updateLayersList();
        },
        updateLayersList: function () {
            var self = this;
            var $layersListHolder = $(".layers-list-holder");
            var $layersList = $("<ul class='layer-list'></ul>");
            var $layer;
            var $checkbox;
            var $delete;
            $layersListHolder.empty();

            this.layers.forEach(function (layer) {
                $layer = $("<li class='layer-li'>Calque " + layer.id + "</li>");
                $checkbox = layer.hidden === false
                    ? $("<input type='checkbox' attr-num='" + layer.id + "' checked>")
                    : $("<input type='checkbox' attr-num='" + layer.id + "'>");
                $checkbox.appendTo($layer);

                $delete = $("<button attr-num='" + layer.id + "'>Supprimer</button>");
                $delete.appendTo($layer);

                $layer.find("input").on("change", function (event) {
                    var num = (event.target.getAttribute("attr-num"));
                    self.toggleLayer(num);
                });

                $layer.find("button").on("click", function (event) {
                    var num = (event.target.getAttribute("attr-num"));
                    self.deleteLayer(num);
                });

                $layer.appendTo($layersList);
            });

            $layersList.appendTo($layersListHolder);
        },
        toggleLayer: function (num) {
            var $layer = $("#layer-" + num);
            var layer = $.grep(this.layers, function (e) {
                return e.id === parseInt(num);
            });

            if (false === $layer.hasClass("hidden")) {
                $layer.addClass("hidden");
                layer[0].hidden = true;
            } else {
                $layer.removeClass("hidden");
                layer[0].hidden = false;
            }
        },
        updateCurrentLayer: function () {
            var i = this.layers.length;
            var again = true;

            while (true === again) {
                if (undefined === this.layers[i] || this.layers[i].hidden === false) {
                    this.currentLayer = i;
                    again = false;
                }
                i -= 1;
            }
        },
        deleteLayer: function (num) {
            var layer = $.grep(this.layers, function (e) {
                return e.id === parseInt(num);
            });

            var index = this.layers.indexOf(layer[0]);
            this.layers.splice(index, 1);

            var $layer = $("#layer-" + num);
            $layer.remove();

            this.updateLayersList();
        },
        deleteAllLayers: function () {
            var self = this;
            var i;

            for (i = this.layers.length - 1; i >= 0; i -= 1) {
                this.deleteLayer(this.layers[i].id);
            }
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
        initColors: function () {
            // On set la value de l'input Hexa
            var inputHexa = document.querySelector(".color-hexa");
            inputHexa.value = this.toolColorHex;

            // On converti l'hexa en RGB
            this.toolColorRGB = this.hexToRGB(this.toolColorHex);

            // On récupère les inputs RGB et on leur asigne les valeurs RGB
            var inputsRGB = document.getElementsByClassName("color-rgb");
            inputsRGB[0].value = this.toolColorRGB.r;
            inputsRGB[1].value = this.toolColorRGB.g;
            inputsRGB[2].value = this.toolColorRGB.b;

            // On converti le RGB en HSL
            this.toolColorHSL = this.rgbToHSL(this.toolColorRGB);

            // On récupère les inputs RGB et on leur asigne les valeurs RGB
            var inputsHSL = document.getElementsByClassName("color-hsl");
            inputsHSL[0].value = this.toolColorHSL.h;
            inputsHSL[1].value = this.toolColorHSL.s;
            inputsHSL[2].value = this.toolColorHSL.l;
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
            this.toolColorHex = inputHexa.value;
            this.initColors();
        },
        updateFromRGB: function () {
            // On garde une référence vers this, car on la perd dans le each sinon
            var self = this;
            var val, tmp;

            // Petit each jQuery, la facilité !
            $.each(this.toolColorRGB, function (index, value) {
                tmp = document.querySelector("#color-" + index).value;
                val = (tmp > 255 || tmp < 0)
                    ? value
                    : tmp;

                self.toolColorRGB[index] = val;
            });

            this.toolColorHex = this.rgbToHex(this.toolColorRGB);
            this.initColors();
        },
        updateFromHSL: function () {
            // On garde une référence vers this, car on la perd dans le each sinon
            var self = this;
            var val, tmp;

            // Petit each jQuery, la facilité !
            $.each(this.toolColorHSL, function (index, value) {
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

                self.toolColorHSL[index] = val;
            });

            this.toolColorRGB = this.hslToRGB(this.toolColorHSL);
            this.toolColorHex = this.rgbToHex(this.toolColorRGB);
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
            var m, c, x;

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