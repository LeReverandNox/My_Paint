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
        toolColorHex: "#ff0000",
        toolColorRGB: null,
        toolColorHSL: null,

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
            var i;

            // On set la value de l'input Hexa
            var inputHexa = document.querySelector("#color-hexa");
            inputHexa.value = this.toolColorHex;

            // On converti l'hexa en RGB
            this.toolColorRGB = this.hexToRGB(this.toolColorHex);

            // On récupère les inputs RGB et on leur asigne les valeurs RGB
            var inputsRGB = document.getElementsByClassName("color-rgb");
            i = 0;
            this.toolColorRGB.forEach(function (value) {
                inputsRGB[i].value = value;
                i += 1;
            });
        },
        hexToRGB: function (hex) {
            // On retire le hash et on converti le code hexa en base16
            hex = parseInt(hex.substr(1, hex.length - 1), 16);

            // On genere les 3 composantes grace aux opéraions bit à bit
            var r = hex >> 16;
            var g = hex >> 8 & 0xFF;
            var b = hex & 0xFF;
            return [r, g, b];
        }
    };

    document.addEventListener("DOMContentLoaded", function () {
        paint.init();
    });

}());