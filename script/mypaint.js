/*jslint browser this for bitwise */
/*global alert $ Tool tools toolFactory URL */

(function (global) {
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

            Tool.tmpLayer.canvas = document.querySelector("#canvas-tmp");
            Tool.tmpLayer.context = Tool.tmpLayer.canvas.getContext("2d");

            Tool.symLayer.canvas = document.querySelector("#canvas-sym");
            Tool.symLayer.context = Tool.symLayer.canvas.getContext("2d");

            Tool.currLayer.canvas = this.background.cavas;
            Tool.currLayer.context = this.background.context;

            this.inputWidth = document.querySelector("#canvas-width");
            this.inputHeight = document.querySelector("#canvas-height");

            // On démarrer les listeners
            this.addListeners();

            this.initColors();

            this.setDimensions();

            this.setToolSize();
            this.setToolFillness();

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
            Tool.tmpLayer.context.canvas.width = this.canvasSize.width;
            Tool.tmpLayer.context.canvas.height = this.canvasSize.height;

            // Ainsi que sa taille visuelle
            this.background.canvas.style.width = this.canvasSize.width + "px";
            this.background.canvas.style.height = this.canvasSize.height + "px";
            Tool.tmpLayer.canvas.style.width = this.canvasSize.width + "px";
            Tool.tmpLayer.canvas.style.height = this.canvasSize.height + "px";

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
            document.querySelector("#tool-fillness").addEventListener("click", this.setToolFillness.bind(this));
            document.querySelector("#tool-color").addEventListener("input", this.updateColor.bind(this));
            document.querySelector("#new-layer").addEventListener("click", this.addLayer.bind(this));
            document.querySelector(".layers-list-holder").addEventListener("click", this.manipulateLayers.bind(this));
            document.querySelector("#tools-holder").addEventListener("click", this.setCurrentTool.bind(this));
            document.querySelector("#tool-symetrie").addEventListener("click", this.setSymetrie.bind(this));

            document.querySelector(".big-canvas-holder").addEventListener("mousedown", this.onMouseDown.bind(this));
            document.querySelector(".big-canvas-holder").addEventListener("mousemove", this.onMouseMove.bind(this));
            document.querySelector(".big-canvas-holder").addEventListener("mouseup", this.onMouseUp.bind(this));

            document.querySelector(".big-canvas-holder").addEventListener("dragover", this.preventDrag);
            document.querySelector(".big-canvas-holder").addEventListener("drop", this.importOnDrop.bind(this));
            document.querySelector("#image-upload").addEventListener("change", this.uploadImage.bind(this));
            document.querySelector(".download-holder").addEventListener("click", this.exportImgPngJpeg.bind(this));
        },
        setSymetrie: function (event) {
            switch (event.target.className) {
            case "sym-h":
                Tool.symHorizontal = Tool.symHorizontal === true
                    ? false
                    : true;
                break;
            case "sym-v":
                Tool.symVertical = Tool.symVertical === true
                    ? false
                    : true;
                break;
            }
        },
        preventDrag: function (event) {
            event.preventDefault();
        },
        importOnDrop: function (event) {
            event.preventDefault();
            var dt = event.dataTransfer;
            var file = dt.files[0];
            var img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = function () {
                var x = event.layerX - (img.width / 2);
                var y = event.layerY - (img.height / 2);
                Tool.currLayer.context.drawImage(img, x, y);
            };
        },
        uploadImage: function (event) {
            var self = this;
            var file = event.target.files[0];
            var img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = function () {
                self.resizeCanvas(img.width, img.height);
                Tool.currLayer.context.drawImage(img, 0, 0);
            };
        },
        exportImgPngJpeg: function (event) {
            // Si on choisi de dl en jpeg, on rempli d'abord le canvas temporaire de blanc, sinon la transparence rend noire
            if (event.target.className === "download-jpeg") {
                Tool.tmpLayer.context.fillStyle = "#ffffff";
                Tool.tmpLayer.context.fillRect(0, 0, Tool.tmpLayer.canvas.width, Tool.tmpLayer.canvas.height);
            }

            // On merge le canvas background sur le canvas tmp
            if (this.background.hidden === false) {
                Tool.tmpLayer.context.drawImage(this.background.canvas, 0, 0);
            }

            // On copie le contenue de this.layers, on le trie par ordre d'affichage, on foreach dessus. Pour chaque layer visible, on le merge avec le canvas tmp
            var layersForMerge = Object.create(this.layers);
            layersForMerge.sort(this.comparator);
            layersForMerge.forEach(function (layer) {
                if (layer.hidden === false) {
                    Tool.tmpLayer.context.drawImage(layer.canva, 0, 0);
                }
            });

            // On creer le lien du fichier, avec le bon type et on click dessus.
            var link = document.createElement('a');
            if (event.target.className === "download-png") {
                link.download = "my_paint.png";
                link.href = Tool.tmpLayer.canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
            } else {
                link.download = "my_paint.jpeg";
                link.href = Tool.tmpLayer.canvas.toDataURL("image/jpeg").replace("image/jpeg", "image/octet-stream");
            }
            link.click();

            // On clear le canvas tmp.
            Tool.tmpLayer.context.clearRect(0, 0, Tool.tmpLayer.canvas.width, Tool.tmpLayer.canvas.height);
        },
        onMouseDown: function (mouse) {
            this.currentTool.handleMouseDown(mouse);
        },
        onMouseMove: function (mouse) {
            this.currentTool.handleMouseMove(mouse);
        },
        onMouseUp: function (mouse) {
            this.currentTool.handleMouseUp(mouse);
        },
        setCurrentTool: function (tools) {
            this.currentToolName = tools.target.getAttribute("attr-tool");
            this.currentTool = toolFactory.new(this.currentToolName);
        },
        resizeCanvas: function (widthTo, heightTo) {
            // On vérifie que les inputs contiennent bien des int, sinon on assigne les valeurs par défaut
            var width;
            var height;
            if (undefined === heightTo) {
                width = (isNaN(parseInt(this.inputWidth.value, 10)) || this.inputWidth.value < 1)
                    ? this.canvasSize.width
                    : this.inputWidth.value;
                height = (isNaN(parseInt(this.inputHeight.value, 10)) || this.inputHeight.value < 1)
                    ? this.canvasSize.height
                    : this.inputHeight.value;
            } else {
                width = widthTo;
                height = heightTo;
            }
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
        setToolFillness: function (click) {
            var inputFillness = document.querySelector("#tool-fillness");
            if (undefined !== click) {
                if (Tool.toolFill === false) {
                    Tool.toolFill = true;
                } else {
                    Tool.toolFill = false;
                }
            }
            inputFillness.checked = Tool.toolFill;
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
                    Tool.currLayer.context = i;
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
            var $tmpCanvas = $(Tool.tmpLayer.canvas);

            this.layers.forEach(function (otherLayer) {
                otherLayer.active = false;
            });
            this.background.active = true;
            $tmpCanvas.css({"z-index": 0});

            Tool.currLayer.canvas = this.background.canvas;
            Tool.currLayer.context = this.background.context;
        },
        activateLayer: function (layer) {
            var $tmpCanvas = $(Tool.tmpLayer.canvas);

            this.layers.forEach(function (otherLayer) {
                otherLayer.active = false;
            });
            this.background.active = false;

            layer.active = true;
            $tmpCanvas.css({"z-index": layer.order});

            Tool.currLayer.canvas = layer.canvas;
            Tool.currLayer.context = layer.context;
        },
        verifyCurrentLayer: function (layer) {
            var $tmpCanvas = $(Tool.tmpLayer.canvas);

            var layersForDisplay = JSON.parse(JSON.stringify(this.layers));
            layersForDisplay.sort(this.comparator);
            var lastLayer = layersForDisplay.length >= 1
                ? layersForDisplay[layersForDisplay.length - 1]
                : null;

            if (layer.active === true) {
                if (lastLayer === null) {
                    this.background.active = true;
                    Tool.currLayer.canvas = this.background.canvas;
                    Tool.currLayer.context = this.background.context;
                    $tmpCanvas.css({"z-index": 0});
                } else {
                    var layerToActivate = this.grepOne(this.layers, "id", lastLayer.id);
                    layerToActivate.active = true;
                    Tool.currLayer.canvas = layerToActivate.canvas;
                    Tool.currLayer.context = layerToActivate.context;
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
            var inputStrokeHexa = document.querySelector(".color-hexa-stroke");
            var inputFillHexa = document.querySelector(".color-hexa-fill");
            inputStrokeHexa.value = Tool.toolStrokeColorHex;
            inputFillHexa.value = Tool.toolFillColorHex;

            // On converti l'hexa en RGB
            Tool.toolStrokeColorRGB = this.hexToRGB(Tool.toolStrokeColorHex);
            Tool.toolFillColorRGB = this.hexToRGB(Tool.toolFillColorHex);

            // On récupère les inputs RGB et on leur asigne les valeurs RGB
            var inputsStrokeRGB = document.getElementsByClassName("color-rgb-stroke");
            inputsStrokeRGB[0].value = Tool.toolStrokeColorRGB.r;
            inputsStrokeRGB[1].value = Tool.toolStrokeColorRGB.g;
            inputsStrokeRGB[2].value = Tool.toolStrokeColorRGB.b;

            var inputsFillRGB = document.getElementsByClassName("color-rgb-fill");
            inputsFillRGB[0].value = Tool.toolFillColorRGB.r;
            inputsFillRGB[1].value = Tool.toolFillColorRGB.g;
            inputsFillRGB[2].value = Tool.toolFillColorRGB.b;

            // On converti le RGB en HSL
            Tool.toolStrokeColorHSL = this.rgbToHSL(Tool.toolStrokeColorRGB);
            Tool.toolFillColorHSL = this.rgbToHSL(Tool.toolFillColorRGB);

            // On récupère les inputs RGB et on leur asigne les valeurs RGB
            var inputsStrokeHSL = document.getElementsByClassName("color-hsl-stroke");
            inputsStrokeHSL[0].value = Tool.toolStrokeColorHSL.h;
            inputsStrokeHSL[1].value = Tool.toolStrokeColorHSL.s;
            inputsStrokeHSL[2].value = Tool.toolStrokeColorHSL.l;

            var inputsFillHSL = document.getElementsByClassName("color-hsl-fill");
            inputsFillHSL[0].value = Tool.toolFillColorHSL.h;
            inputsFillHSL[1].value = Tool.toolFillColorHSL.s;
            inputsFillHSL[2].value = Tool.toolFillColorHSL.l;
        },
        updateColor: function (e) {
            var mode = e.target.getAttribute("attr-mode");

            // On switch sur la premiere classe... technique de gitan
            switch (e.target.className.split(" ")[0]) {
            case "color-hexa":
                this.updateFromHex(mode);
                break;
            case "color-rgb":
                this.updateFromRGB(mode);
                break;
            case "color-hsl":
                this.updateFromHSL(mode);
                break;
            }
        },
        updateFromHex: function (mode) {
            if (mode === "stroke") {
                var inputStrokeHexa = document.querySelector(".color-hexa-stroke");
                Tool.toolStrokeColorHex = inputStrokeHexa.value;
            } else if (mode === "fill") {
                var inputFillHexa = document.querySelector(".color-hexa-fill");
                Tool.toolFillColorHex = inputFillHexa.value;
            }
            this.initColors();
        },
        updateFromRGB: function (mode) {
            var val;
            var tmp;

            // Petit each jQuery, la facilité !
            if (mode === "stroke") {
                $.each(Tool.toolStrokeColorRGB, function (index, value) {
                    tmp = document.querySelector("#stroke-color-" + index).value;
                    val = (tmp > 255 || tmp < 0)
                        ? value
                        : tmp;
                    Tool.toolStrokeColorRGB[index] = val;
                });
                Tool.toolStrokeColorHex = this.rgbToHex(Tool.toolStrokeColorRGB);
            } else if (mode === "fill") {
                $.each(Tool.toolFillColorRGB, function (index, value) {
                    tmp = document.querySelector("#fill-color-" + index).value;
                    val = (tmp > 255 || tmp < 0)
                        ? value
                        : tmp;
                    Tool.toolFillColorRGB[index] = val;
                });
                Tool.toolFillColorHex = this.rgbToHex(Tool.toolFillColorRGB);
            }

            this.initColors();
        },
        updateFromHSL: function (mode) {
            var val;
            var tmp;

            // Petit each jQuery, la facilité !
            if (mode === "stroke") {
                $.each(Tool.toolStrokeColorHSL, function (index, value) {
                    tmp = document.querySelector("#stroke-color-" + index).value;
                    if (index === "h") {
                        val = (tmp > 359 || tmp < 0)
                            ? value
                            : tmp;
                    } else {
                        val = (tmp > 100 || tmp < 0)
                            ? value
                            : tmp;
                    }

                    Tool.toolStrokeColorHSL[index] = val;
                });
                Tool.toolStrokeColorRGB = this.hslToRGB(Tool.toolStrokeColorHSL);
                Tool.toolStrokeColorHex = this.rgbToHex(Tool.toolStrokeColorRGB);
            } else if (mode === "fill") {
                $.each(Tool.toolFillColorHSL, function (index, value) {
                    tmp = document.querySelector("#fill-color-" + index).value;
                    if (index === "h") {
                        val = (tmp > 359 || tmp < 0)
                            ? value
                            : tmp;
                    } else {
                        val = (tmp > 100 || tmp < 0)
                            ? value
                            : tmp;
                    }

                    Tool.toolFillColorHSL[index] = val;
                });
                Tool.toolFillColorRGB = this.hslToRGB(Tool.toolFillColorHSL);
                Tool.toolFillColorHex = this.rgbToHex(Tool.toolFillColorRGB);
            }
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
        componentToHex: function (c) {
            var hex = c.toString(16);
            return hex.length === 1
                ? "0" + hex
                : hex;
        },
        rgbToHex: function (rgb) {
            return "#" + this.componentToHex(rgb.r) + this.componentToHex(rgb.g) + this.componentToHex(rgb.b);
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
    global.paint = paint;
}(this));