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

            // console.log(this.context);
        },
        addListeners: function () {
            document.querySelector("#canvas-set-dimensions").addEventListener("click", this.resizeCanvas.bind(this));
        },
        resizeCanvas: function () {
            var width = isNaN(parseInt(this.inputWidth.value, 10))
                ? 640
                : this.inputHeight.value;
            var height = isNaN(parseInt(this.inputHeight.value, 10))
             ? 480
             : this.inputHeight.value;

            this.canvasSize.width = width;
            this.canvasSize.height = height;

            this.setDimensions();
        }
    };

    document.addEventListener("DOMContentLoaded", function () {
        paint.init();
    });

}());