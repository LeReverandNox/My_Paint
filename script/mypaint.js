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

        init: function () {
            this.canvas = document.querySelector("#canvas1");
            this.context = this.canvas.getContext("2d");

            this.inputWidth = document.querySelector("#canvas-width");
            this.inputHeight = document.querySelector("#canvas-height");

            // On démarrer les listeners
            this.addListeners();

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
        },
        resizeCanvas: function () {
            // On vérifie que les inputs contiennent bien des int, sinon on assigne les valeurs par défaut
            var width = isNaN(parseInt(this.inputWidth.value, 10))
                ? 640
                : this.inputWidth.value;
            var height = isNaN(parseInt(this.inputHeight.value, 10))
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
        }
    };

    document.addEventListener("DOMContentLoaded", function () {
        paint.init();
    });

}());