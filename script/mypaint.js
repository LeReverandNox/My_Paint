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

        init: function () {
            this.canvas = document.querySelector("#canvas1");
            this.context = this.canvas.getContext("2d");

            this.setDimensions();
        },
        setDimensions: function () {
            // On définit la taille interne du canvas
            this.context.width = this.canvasSize.width;
            this.context.height = this.canvasSize.height;

            // Ainsi que sa taille visuelle
            this.canvas.style.width = this.canvasSize.width + "px";
            this.canvas.style.height = this.canvasSize.height + "px";

            console.log(this.context);
        }
    };

    document.addEventListener("DOMContentLoaded", function () {
        paint.init();
    });

}());