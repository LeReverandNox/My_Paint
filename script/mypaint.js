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
        toolColorHex: "#af09ef",
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

        init: function () {
            this.canvas = document.querySelector("#canvas1");
            this.context = this.canvas.getContext("2d");

            this.inputWidth = document.querySelector("#canvas-width");
            this.inputHeight = document.querySelector("#canvas-height");

            // On démarrer les listeners
            this.addListeners();

            this.initColors();

            this.setDimensions();

        },
        setDimensions: function () {
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
        },
        resizeCanvas: function () {
            // On vérifie que les inputs contiennent bien des int, sinon on assigne les valeurs par défaut
            var width = (isNaN(parseInt(this.inputWidth.value, 10)) || this.inputWidth.value < 1)
                ? 640
                : this.inputWidth.value;
            var height = (isNaN(parseInt(this.inputHeight.value, 10)) || this.inputHeight.value < 1)
                ? 480
                : this.inputHeight.value;

             // On assigne ces valeurs dans canvasSize
            this.canvasSize.width = width;
            this.canvasSize.height = height;

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
        },
        setToolSize: function () {
            // On récupère la value de l'input tool-thickness
            var inputThickness = document.querySelector("#tool-thickness");
            var thickness = (isNaN(parseInt(inputThickness.value, 10)) || inputThickness.value < 1)
                ? 5
                : inputThickness.value;

            // On reaffiche la valeur au cas ou le gars a entré de la merde dans l'input
            inputThickness.value = thickness;
            // Et on modifie toolThickness en conséquence
            this.toolThickness = thickness;
        },
        initColors: function () {
            // On set la value de l'input Hexa
            var inputHexa = document.querySelector("#color-hexa");
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

            console.log(this.toolColorHex);
            console.log(this.toolColorRGB);
            console.log(this.toolColorHSL);
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
        toPercent: function (amount, limit) {
            return amount / limit;
        }
    };

    document.addEventListener("DOMContentLoaded", function () {
        paint.init();
    });

}());