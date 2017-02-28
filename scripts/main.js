/**
*   Alchemy Canvas
*   Author: Logan Wilkerson
*
*   The base alchemy library
*
*              /\__
*     .--.----'  - \
*    /    )    \___/
*   |  '------.___)
*    `---------`
*/
var alchemy = alchemy || {};
(function(A) {

    var resolveLineWidth = function(lineWidth) {
        return typeof lineWidth !== 'undefined' ? lineWidth : 1;
    };

    var resolveStrokeStyle = function(strokeStyle) {
        return typeof strokeStyle !== 'undefined' ? strokeStyle : 'rbga(255,255,255,1)';
    };    

    /**
     * Draw a line within the canvas
     *
     * @param {Uint8ClampedArray} data - the image data of the entire canvas
     * @param {number} canvasWidth - width of canvas
     * @param {number} x - x position
     * @param {number} y - y position
     * @param {number} r - red pixel data (0 - 255)
     * @param {number} g - green pixel data (0 - 255)
     * @param {number} b - blue pixel data (0 - 255)
     * @param {number} a - alpha pixel data (0 - 1)
     */
    A.setPixel = function(data, canvasWidth, x, y, r, g, b, a) {        
        var n = (y * canvasWidth + x) * 4;
        data[n] = r;
        data[n + 1] = b;
        data[n + 2] = g;
        data[n + 3] = Math.round(a * 255);
    };

    /**
     * Draw a line within the canvas
     *
     * @param {Uint8ClampedArray} data - the image data of the entire canvas
     * @param {number} canvasWidth - width of canvas
     * @param {number} x0 - top left x
     * @param {number} y0 - top left y
     * @param {number} x1 - bottom right x
     * @param {number} y1 - bottom right y
     * @param {number} r - red pixel data (0 - 255)
     * @param {number} g - green pixel data (0 - 255)
     * @param {number} b - blue pixel data (0 - 255)
     * @param {number} a - alpha pixel data (0 - 1)
     */
    A.setPixelArea = function(data, canvasWidth, x0, y0, x1, y1, r, g, b, a) {
        for (var x = x0; x <= x1; x++) {
            for (var y = y0; y <= y1; y++) {
                A.setPixel(data, canvasWidth, x, y, r, g, b, a);
            }
        }
    };

    /**
     * Draw a line within the canvas
     *
     * @param {HTMLCanvasElement, CanvasRenderingContext2D} canvas - 
     *      Either the  canvas html element or the context of said 
     *      element you wish to draw the line on
     * @param {number} startX - X coordinate to start the line at
     * @param {number} startY - Y coordinate to start the line at
     * @param {number} endX - X coordinate to end the line at
     * @param {number} endY - Y coordinate to end the line at
     * @param {number} lineWidth - integer width of the line
     * @param {string | CanvasGradient | CanvasPattern} strokeStyle - style to use
     */
    A.drawLine = function(canvas, startX, startY, endX, endY, lineWidth, strokeStyle) {
        lineWidth = resolveLineWidth(lineWidth);
        strokeStyle = resolveStrokeStyle(strokeStyle);
        var context = A.getContext(canvas);

        context.beginPath();
        context.lineWidth = lineWidth;
        context.strokeStyle = strokeStyle;
        context.moveTo(startX, startY);
        context.lineTo(endX, endY);
        context.stroke();
        context.closePath();
    };

    /**
     * Draw a line using Bresenham's Line Algorithm. Slower, but forces clean lines
     * Based on the algorithm found at
     * http://rosettacode.org/wiki/Bitmap/Bresenham's_line_algorithm#JavaScript
     */
    A.drawBLine = function(canvas, startX, startY, endX, endY, r, g, b, a) {
        r = typeof r !== 'undefined' ? r : 0;
        g = typeof g !== 'undefined' ? g : 0;
        b = typeof b !== 'undefined' ? b : 0;
        a = typeof a !== 'undefined' ? a : 1;

        var context = A.getContext(canvas);
        var imgData = context.getImageData(0, 0, canvas.width, canvas.height);
        var data = imgData.data;

        var p = function(x, y) {
            A.setPixel(data, canvas.width, x, y, r, g, b, a);
        };
        A.generateBLine(startX, startY, endX, endY, p, false);
        context.putImageData(imgData, 0, 0);
    };

    /**
     * Generate a pixel line using Bresenham's Line Algorithm
     *
     * @param {number} startX - X coordinate to start the line at
     * @param {number} startY - Y coordinate to start the line at
     * @param {number} endX - X coordinate to end the line at
     * @param {number} endY - Y coordinate to end the line at
     * @param {function} stepCallback - function that takes x, y for each pixel
     * @param {boolean} saveLine - If the line should actually be saved. If true
     *      an array of objects in the form {x:x, y:y} for each pixel will be
     *      returned. Otherwise an empty array will be returned. Useful if
     *      all the work is done in the stepCallback function and you don't
     *      need to waste the memory. Default: true
     */
    A.generateBLine = function(x0, y0, x1, y1, stepCallback, saveLine) {
        typeof saveLine !== 'undefined' ? saveLine : true;
        var coords = [];
        var dx = Math.abs(x1 - x0),
            sx = x0 < x1 ? 1 : -1;
        var dy = Math.abs(y1 - y0),
            sy = y0 < y1 ? 1 : -1;
        var err = (dx > dy ? dx : -dy) / 2;
        while (true) {
            if(saveLine) coords.push({x:x0,y:y0});
            stepCallback(x0, y0)
            if (x0 === x1 && y0 === y1) break;
            var e2 = err;
            if (e2 > -dx) {
                err -= dy;
                x0 += sx;
            }
            if (e2 < dy) {
                err += dx;
                y0 += sy;
            }
        }
        return coords;
    };

    /**
     * Draw an arc
     *
     * @param {HTMLCanvasElement | CanvasRenderingContext2D} canvas
     * @param {number} centerX - X coordinate for the center of the circle
     * @param {number} centerY - Y coordinate for the center of the circle
     * @param {number} radius - Radius of the circle
     * @param {number} startAngle - starting angle of the circle
     * @param {number} endAngle - ending angle of the circle
     * @param {number} lineWidth - integer width of the line
     * @param {string | CanvasGradient | CanvasPattern} strokeStyle - style to use
     */
    A.drawArc = function(canvas, centerX, centerY, radius, startAngle, endAngle, lineWidth, strokeStyle) {
        lineWidth = resolveLineWidth(lineWidth);
        strokeStyle = resolveStrokeStyle(strokeStyle);
        var context = A.getContext(canvas);
        context.beginPath();
        context.lineWidth = lineWidth;
        context.strokeStyle = strokeStyle;
        context.arc(centerX, centerY, radius, startAngle, endAngle);
        context.stroke();
        context.closePath();
    };

    /**
     * Draw a circle
     *
     * @param {HTMLCanvasElement | CanvasRenderingContext2D} canvas
     * @param {number} centerX - X coordinate for the center of the circle
     * @param {number} centerY - Y coordinate for the center of the circle
     * @param {number} radius - Radius of the circle
     * @param {number} lineWidth - integer width of the line
     * @param {string | CanvasGradient | CanvasPattern} strokeStyle - style to use
     */
    A.drawCircle = function(canvas, centerX, centerY, radius, lineWidth, strokeStyle) {
        var context = A.getContext(canvas);
        A.drawArc(canvas, centerX, centerY, radius, 0, 2* Math.PI, lineWidth, strokeStyle);
    };

    A.fillRect = function(canvas, x0, y0, x1, y1, fillStyle) {
        var context = A.getContext(canvas);
        context.fillStyle = fillStyle
        context.fillRect(x0, y0, x1, y1);
    };

    A.getContext = function(canvas) {
        if(canvas instanceof HTMLCanvasElement) {
            return canvas.getContext('2d');
        }
        if(canvas instanceof CanvasRenderingContext2D) {
            return canvas;
        }
        return null;
    };
}(alchemy));

(function() {
    /**
     * DungeonMapper
     * 
     * @author: Logan Wilkerson | <lcwilker@gmail.com>
     *     
     * @param {string} dungeonId - The id of the element to turn into a dungeon
     * @param {object} config - the mapper configuration
     */
    var DungeonMapper = function(dungeonId, config) {

        //Config
        this.config = this.config || {};
        this.config.width = 5; //extra one is for the right most gird line
        this.config.height = 5;
        this.config.cellSize = 30; //Number of pixel WHITESPACE

        this.config.emptyFillStyle = 'rgba(255, 255, 255, 1)';
        this.config.highlightFillStyle = 'rgba(0, 0, 255, .5)'
        this.config.wallFillStyle = 'rgba(0, 0, 0, 1)';

        this.config.grid = {};
        this.config.grid.style = {};
        this.config.grid.style.r = 0;
        this.config.grid.style.g = 0;
        this.config.grid.style.b = 0;
        this.config.grid.style.a = .25;
        this.config.grid.lineWidth = 5;

        this.config.cellRenderers = {};

        this.config.ink = {}
        this.config.ink.style = {}
        this.config.ink.style.r = 0;
        this.config.ink.style.g = 0;
        this.config.ink.style.b = 0;
        this.config.ink.style.a = 1;
        this.config.templateCell = {
            x : 0,
            y : 0,
            isSelected : false,
            isHighlighted : false,
            type : 'blank',
            orientation : 'north',
            priority : 0
        };

        //State
        this.dungeon = null;
        this.context = null;
        this.dungeonPixelSize = null;
        this.selectedCell = null;
        this.cells = null;
        this.selectedType = 'blank';
        this.selectedOrientation = 'north';

        //Draw Session
        this.drawSession = {};
        this.drawSession.started = false;
        this.drawSession.drawnCells = new Set();

        //Selection state
        this.selection = {};
        this.selection.startCell = null;
        this.selection.endCell = null;
        this.selection.selectedCells = [];

        //Set up config
        alchemy.extend(this.config, config);

        //Get the Dungeon
        this.dungeon = document.getElementById(dungeonId);
        this.dungeon.mapper = this;

        var redrawSelections = function(mapper, oldCells, newCells) {
                mapper.startDrawSession();                
                for (var i in oldCells) {
                    oldCells[i].isHighlighted = false;
                }
                for (var i in newCells) {
                    newCells[i].isHighlighted = true;
                }
                for (var i in oldCells) {
                    mapper.drawCell(oldCells[i]);
                }
                for (var i in newCells) {
                    mapper.drawCell(newCells[i]);
                }
                mapper.endDrawSession();
        };

        var dungeonMouseMoveHandler = function(event) {
            var coordinates  = this.mapper.getClickEventCoordinates(event);
            var cellPosition = this.mapper.getCellPosition(coordinates.x, coordinates.y);
            
            var movingCell = this.mapper.getCell(cellPosition.x, cellPosition.y);
            if(typeof movingCell !== 'undefined' && (this.mapper.selection.endCell.x !== movingCell.x || this.mapper.selection.endCell.y !== movingCell.y)) {

                //Reset the end cell
                this.mapper.selection.endCell = movingCell;

                //Store the last set of selected cells and reset the current selected cells
                var previouslySelectedCells =  this.mapper.selection.selectedCells;
                this.mapper.selection.selectedCells = [];

                //Need to store the mapper and selected cells for easier closure
                var mapper = this.mapper;
                var selectedCells = mapper.selection.selectedCells;
                var stepCallback = function(x, y) {
                        selectedCells.push(mapper.getCell(x, y));
                };

                //Generate the selection
                alchemy.generateBLine(
                    this.mapper.selection.startCell.x,
                    this.mapper.selection.startCell.y,
                    this.mapper.selection.endCell.x,
                    this.mapper.selection.endCell.y,
                    stepCallback,
                    false
                );

                redrawSelections(this.mapper, previouslySelectedCells, this.mapper.selection.selectedCells);
            }
        };

        var dungeonMouseDownHandler = function(event) {
            var coordinates  = this.mapper.getClickEventCoordinates(event);
            var cellPosition = this.mapper.getCellPosition(coordinates.x, coordinates.y);
            this.mapper.selection.startCell = this.mapper.getCell(cellPosition.x, cellPosition.y);
            this.mapper.selection.endCell = this.mapper.selection.startCell;
            this.mapper.selection.selectedCells = []
            this.mapper.selection.selectedCells.push(this.mapper.selection.startCell);
            redrawSelections(this.mapper, [], this.mapper.selection.selectedCells);
            this.mapper.dungeon.removeEventListener('mousemove', dungeonMouseMoveHandler, false);
            this.mapper.dungeon.addEventListener('mousemove', dungeonMouseMoveHandler, false);
        };

        var generateDungeonMouseUpHandler = function(mapper) {
            return function (event) {
                var coordinates  = mapper.getClickEventCoordinates(event);
                var cellPosition = mapper.getCellPosition(coordinates.x, coordinates.y);
                  
                if(mapper.selectedType in mapper.config.cellRenderers) {                    
                    for(var i in mapper.selection.selectedCells) {
                        mapper.selection.selectedCells[i].type  = mapper.selectedType;
                        mapper.selection.selectedCells[i].orientation = mapper.selectedOrientation;
                        mapper.selection.selectedCells[i].priority = mapper.config.cellRenderers[mapper.selectedType].priority;
                    }
                }
            
                redrawSelections(mapper, mapper.selection.selectedCells, []);

                mapper.dungeon.removeEventListener('mousemove', dungeonMouseMoveHandler, false);
            }
        };

        /**
         * Initialize the dungeon mapper
         */
        this.init = function(dungeonId) {
            this.drawGrid();
            this.initEvents();
        };

        this.initEvents = function() {
            this.dungeon.addEventListener('mousedown', dungeonMouseDownHandler, false);
            document.body.addEventListener('mouseup', generateDungeonMouseUpHandler(this), false);
        };

        /**
         * Draw the dungeon grid based on the current config
         */
        this.drawGrid = function() {
            this.dungeonPixelSize   = this.getDungeonPixelSize();
            this.dungeon.width      = this.dungeonPixelSize.width;
            this.dungeon.height     = this.dungeonPixelSize.height;

            this.context = alchemy.getContext(dungeon);

            for (var x = 0; x < this.dungeon.width; x += (this.config.cellSize + this.config.grid.lineWidth)) {
                for(var i = 0; i < this.config.grid.lineWidth; i++) {
                    alchemy.drawBLine(this.dungeon, x+i, 0, x+i, this.dungeon.height, this.config.grid.style.r, this.config.grid.style.g, this.config.grid.style.b, this.config.grid.style.a);
                }
            }
            for (var y = 0; y < this.dungeon.height; y += (this.config.cellSize + this.config.grid.lineWidth)) {
                for(var i = 0; i < this.config.grid.lineWidth; i++) {
                    alchemy.drawBLine(this.dungeon, 0, y+i, this.dungeon.width, y+i, this.config.grid.style.r, this.config.grid.style.g, this.config.grid.style.b, this.config.grid.style.a);
                }
            }
        };

        /**
         * Redraw an entire cell. This may cause neighbor cells to redraw their grid walls
         */
        this.drawCell = function(cell) {
            //CHECK FOR SESSION
            if(this.drawSession.started) {
                if(this.drawSession.drawnCells.has(cell)) {
                    return; //ignore cell
                }
            }

            var coords = this.getCellInnerCoordinates(cell.x, cell.y);

            alchemy.fillRect(this.context, coords.x0, coords.y0, coords.x1 - coords.x0 + 1, coords.y1 + 1 - coords.y0, this.config.emptyFillStyle);
            
            if(cell.type in this.config.cellRenderers) {                
                var renderer = this.config.cellRenderers[cell.type];
                renderer.draw(cell, coords);
            }

            if(cell.isHighlighted) {
                alchemy.fillRect(this.context, coords.x0, coords.y0, coords.x1 - coords.x0 + 1, coords.y1 + 1 - coords.y0, this.config.highlightFillStyle);
            }
            
            

            //END
            if(this.drawSession.started) {
                this.drawSession.drawnCells.add(cell);
            }
        };

        //One of north east south or west MUST be set for the corners to work, corners are not done solo
        this.colorGridWall = function(cell, coords, north, northEast, east, southEast, south, southWest, west, northWest, r, g, b, a, edgePercentage) {
            coords = coords !== null ? coords : this.getCellInnerCoordinates(cell.x, cell.y);
            r = typeof r !== 'undefined' ? r : 0;
            g = typeof g !== 'undefined' ? g : 0;
            b = typeof b !== 'undefined' ? b : 0;
            a = typeof a !== 'undefined' ? a : 1;
            edgePercentage = typeof edgePercentage !== 'undefined' ? edgePercentage : 1;
            var imgData = this.context.getImageData(0, 0, this.dungeon.width, this.dungeon.height);
            var data    = imgData.data;

            //North also handles painting the northern corners
            if(north) {
                var startX = northWest ? coords.x0 - this.config.grid.lineWidth : coords.x0;
                var startY = coords.y0 - this.config.grid.lineWidth;
                var endX   = northEast ? coords.x1 + this.config.grid.lineWidth : coords.x1;
                var endY   = coords.y0 - 1;
                if(edgePercentage < .5) {
                    var dX = Math.round((coords.x1 - coords.x0) * edgePercentage);
                    var tempEndX = northWest ? startX + this.config.grid.lineWidth + dX : startX + dX;
                    alchemy.setPixelArea(data, this.dungeon.width, startX, startY, tempEndX, endY, r, g, b, a);
                    startX = northEast ? endX - this.config.grid.lineWidth - dX : endX - dX;

                }
                alchemy.setPixelArea(data, this.dungeon.width, startX, startY, endX, endY, r, g, b, a);
            }

            if(east) {
                var startX = coords.x1 + 1;
                var startY = northEast ? coords.y0 - this.config.grid.lineWidth : coords.y0;
                var endX   = coords.x1 + this.config.grid.lineWidth;
                var endY   = southEast ? coords.y1 + this.config.grid.lineWidth : coords.y1;
                if(edgePercentage < .5) {
                    var dY = Math.round((coords.y1 - coords.y0) * edgePercentage);
                    var tempEndY = northEast ? startY + this.config.grid.lineWidth + dY : startY + dY;
                    alchemy.setPixelArea(data, this.dungeon.width, startX, startY, endX, tempEndY, r, g, b, a);
                    startY = southEast ? endY - this.config.grid.lineWidth - dY : endY - dY;

                }
                alchemy.setPixelArea(data, this.dungeon.width, startX, startY, endX, endY, r, g, b, a);

            }

            //South also handles painting the southern corners
            if(south) {
                var startX = southWest ? coords.x0 - this.config.grid.lineWidth : coords.x0;
                var startY = coords.y1 + 1;
                var endX   = southEast ? coords.x1 + this.config.grid.lineWidth : coords.x1;
                var endY   = coords.y1 + this.config.grid.lineWidth;
                if(edgePercentage < .5) {
                    var dX = Math.round((coords.x1 - coords.x0) * edgePercentage);
                    var tempEndX = southWest ? startX + this.config.grid.lineWidth + dX : startX + dX;
                    alchemy.setPixelArea(data, this.dungeon.width, startX, startY, tempEndX, endY, r, g, b, a);
                    startX = southEast ? endX - this.config.grid.lineWidth - dX : endX - dX;

                }
                alchemy.setPixelArea(data, this.dungeon.width, startX, startY, endX, endY, r, g, b, a);
            }

            if(west) {
                var startX = coords.x0 - this.config.grid.lineWidth;
                var startY = northWest ? coords.y0 - this.config.grid.lineWidth : coords.y0;
                var endX   = coords.x0 - 1;
                var endY   = southWest ? coords.y1 + this.config.grid.lineWidth : coords.y1;
                if(edgePercentage < .5) {
                    var dY = Math.round((coords.y1 - coords.y0) * edgePercentage);
                    var tempEndY = northWest ? startY + this.config.grid.lineWidth + dY : startY + dY;
                    alchemy.setPixelArea(data, this.dungeon.width, startX, startY, endX, tempEndY, r, g, b, a);
                    startY = southWest ? endY - this.config.grid.lineWidth - dY : endY - dY;
                }
                alchemy.setPixelArea(data, this.dungeon.width, startX, startY, endX, endY, r, g, b, a);
            }

            this.context.putImageData(imgData, 0, 0);
        };

        this.getCell = function(x, y) {
            if(x < 0 || y < 0 || x >= this.config.width || y >= this.config.height) return null;
            if(this.cells === null) {
                this.cells = [];
            }
            if(this.cells.length <= x) {
                for (var i = this.cells.length; i <= x; i++) {
                    this.cells.push([]);
                }
            }
            if(this.cells[x].length <= y) {
                for (var i = this.cells[x].length; i <= y; i++) {
                    this.cells[x].push(null)
                }
            }
            if(this.cells[x][y] === null) {
                this.cells[x][y] = alchemy.extend(this.config.templateCell, {
                    x : x, 
                    y : y
                });
            }
            return this.cells[x][y];
        };

        this.startDrawSession = function() {
            if(this.drawSession.started) {
                throw 'Drawing session already started';
            }
            this.drawSession.started = true;
            this.drawSession.drawnCells.clear();
        };

        this.endDrawSession = function() {
            this.drawSession.started = false;
        };

        this.getDungeonPixelSize = function() {
            //The plus one is for the extra line on the end
            var pixelWidth = this.config.width * this.config.cellSize + (this.config.width + 1) * this.config.grid.lineWidth;
            var pixelHeight = this.config.height * this.config.cellSize + (this.config.height + 1) * this.config.grid.lineWidth; 
            return {
                width : pixelWidth,
                height : pixelHeight
            };
        };

        this.getCellPosition = function(x, y) {

            var xCell = Math.floor(x / (this.config.grid.lineWidth + this.config.cellSize));
            var yCell = Math.floor(y / (this.config.grid.lineWidth + this.config.cellSize));

            //In the case we've click on the very last grid line we actually need to go back one step
            if(xCell === this.config.width) {
                xCell -= 1;
            }
            if(yCell === this.config.height) {
                yCell -= 1;
            }

            return {
                'x' : xCell,
                'y' : yCell
            };
        };

        this.getCellInnerCoordinates = function(x, y) {
            var x0 = (x + 1) * this.config.grid.lineWidth + x * this.config.cellSize;
            var y0 = (y + 1) * this.config.grid.lineWidth + y * this.config.cellSize;
            var x1 = x0 + this.config.cellSize - 1;
            var y1 = y0 + this.config.cellSize - 1;
            return {
                x0 : x0,
                y0 : y0,
                x1 : x1,
                y1 : y1
            };
        };

        this.getClickEventCoordinates = function(event) {      
            var rect = this.dungeon.getBoundingClientRect();
            var x = event.clientX - rect.left;
            var y = event.clientY - rect.top;
            return {
                x : x,
                y : y
            };
        };

        this.getStyle = function(obj) {
            return 'rgba(' + String(obj.style.r) + ', ' + String(obj.style.g) + ', ' + String(obj.style.b) + ', ' + String(obj.style.a) + ')';
        };

        this.setSelectedType = function(type) {
            this.selectedType = type;
        };

        this.setSelectedOrientation = function(orientation) {
            this.selectedOrientation = orientation;
        }

        this.addRenderer = function(name, CellRenderer) {
            this.config.cellRenderers[name] = new CellRenderer(this, name);
        };
    };

    window.DungeonMapper = DungeonMapper;
}());

(function() {
    var DefaultRenderer = function(mapper, type) {
        this.mapper = mapper;
        this.type = type;
        this.priority = 0;

        this.draw = function(
            cell,
            coords,
            ignoreCell,
            ignoreNorth,
            ignoreNorthEast,
            ignoreEast,
            ignoreSouthEast,
            ignoreSouth,
            ignoreSouthWest,
            ignoreWest,
            ignoreNorthWest,
            ignoreNeighbors
        ) {
            coords = typeof coords !== 'undefined' && coords !== null ? coords : this.mapper.getCellInnerCoordinates(cell.x, cell.y);
            ignoreCell = typeof ignoreCell !== 'undefined' ? ignoreCell : false;
            ignoreNorth = typeof ignoreNorth !== 'undefined' ? ignoreNorth : false;
            ignoreNorthEast = typeof ignoreNorthEast !== 'undefined' ? ignoreNorthEast : false;
            ignoreEast = typeof ignoreEast !== 'undefined' ? ignoreEast : false;
            ignoreSouthEast = typeof ignoreSouthEast !== 'undefined' ? ignoreSouthEast : false;
            ignoreSouth = typeof ignoreSouth !== 'undefined' ? ignoreSouth : false;
            ignoreSouthWest = typeof ignoreSouthWest !== 'undefined' ? ignoreSouthWest : false;
            ignoreWest = typeof ignoreWest !== 'undefined' ? ignoreWest : false;
            ignoreNorthWest = typeof ignoreNorthWest !== 'undefined' ? ignoreNorthWest : false;
            ignoreNeighbors = typeof ignoreNeighbors !== 'undefined' ? ignoreNeighbors : false;
            this.drawInternal(cell, coords, ignoreCell, ignoreNorth, ignoreNorthEast, ignoreEast, ignoreSouthEast, ignoreSouth, ignoreSouthWest, ignoreWest, ignoreNorthWest, ignoreNeighbors);
        };

        this.drawInternal = function(
            cell,
            coords,
            ignoreCell,
            ignoreNorth,
            ignoreNorthEast,
            ignoreEast,
            ignoreSouthEast,
            ignoreSouth,
            ignoreSouthWest,
            ignoreWest,
            ignoreNorthWest,
            ignoreNeighbors
        ) {};

        this.getNeighbors = function(cell) {
            return {
                north : this.mapper.getCell(cell.x, cell.y - 1),
                northEast : this.mapper.getCell(cell.x + 1, cell.y - 1),
                east  : this.mapper.getCell(cell.x + 1, cell.y),
                southEast : this.mapper.getCell(cell.x + 1, cell.y + 1),
                south : this.mapper.getCell(cell.x, cell.y + 1),
                southWest : this.mapper.getCell(cell.x - 1, cell.y + 1),
                west  : this.mapper.getCell(cell.x - 1, cell.y),
                northWest : this.mapper.getCell(cell.x - 1, cell.y - 1)
            };
        };

        this.neighborCompare = function(cell, types) {
            var neighbors = this.getNeighbors(cell);
            var north     = (neighbors.north     === null && types.includes(null)) || (neighbors.north     !== null && types.includes(neighbors.north.type));
            var east      = (neighbors.east      === null && types.includes(null)) || (neighbors.east      !== null && types.includes(neighbors.east.type));
            var south     = (neighbors.south     === null && types.includes(null)) || (neighbors.south     !== null && types.includes(neighbors.south.type));
            var west      = (neighbors.west      === null && types.includes(null)) || (neighbors.west      !== null && types.includes(neighbors.west.type));
            var northEast = (neighbors.northEast === null && types.includes(null)) || (neighbors.northEast !== null && types.includes(neighbors.northEast.type) && north && east);
            var southEast = (neighbors.southEast === null && types.includes(null)) || (neighbors.southEast !== null && types.includes(neighbors.southEast.type) && south && east);
            var southWest = (neighbors.southWest === null && types.includes(null)) || (neighbors.southWest !== null && types.includes(neighbors.southWest.type) && south && west);
            var northWest = (neighbors.northWest === null && types.includes(null)) || (neighbors.northWest !== null && types.includes(neighbors.northWest.type) && north && west);
            return {
                north     : north,
                east      : east,
                south     : south,
                west      : west,
                northEast : northEast,
                southEast : southEast,
                southWest : southWest,
                northWest : northWest
            };
        };

        this.defaultBlankCell = function(coords) {
            alchemy.fillRect(this.mapper.context, coords.x0, coords.y0, coords.x1 - coords.x0 + 1, coords.y1 + 1 - coords.y0, this.mapper.config.emptyFillStyle);
        };

        this.defaultBlankGridWalls = function(cell, coords, ignoreNorth, ignoreNorthEast, ignoreEast, ignoreSouthEast, ignoreSouth, ignoreSouthWest, ignoreWest, ignoreNorthWest) {
            var c = this.neighborCompare(cell, ['blank', 'fillWall', null]);
            mapper.colorGridWall(cell, coords, c.north && !ignoreNorth, c.northEast && !ignoreNorthEast, c.east && !ignoreEast, c.southEast && !ignoreSouthEast, c.south && !ignoreSouth, c.southWest && !ignoreSouthWest, c.west && !ignoreWest, c.northWest && !ignoreNorthWest, mapper.config.grid.style.r, mapper.config.grid.style.g, mapper.config.grid.style.b, mapper.config.grid.style.a);
        };

        this.defaultRedrawNeighbors = function(
            cell,
            ignoreNorth,
            ignoreNorthEast,
            ignoreEast,
            ignoreSouthEast,
            ignoreSouth,
            ignoreSouthWest,
            ignoreWest,
            ignoreNorthWest
        ) {

            var neighbors = this.getNeighbors(cell);

            var north = neighbors.north;
            var east = neighbors.east;
            var south = neighbors.south;
            var west = neighbors.west;
            var northEast = neighbors.northEast;
            var southEast = neighbors.southEast;
            var southWest = neighbors.southWest;
            var northWest = neighbors.northWest;

            var list = [];
            if(north !== null) list.push(['north', north]);
            if(east !== null) list.push(['east', east]);
            if(south !== null) list.push(['south', south]);
            if(west !== null) list.push(['west', west]);
            if(northEast !== null) list.push(['northEast', northEast]);
            if(southEast !== null) list.push(['southEast', southEast]);
            if(southWest !== null) list.push(['southWest', southWest]);
            if(northWest !== null) list.push(['northWest', northWest]);

            list.sort(function(a,b) {
                return a[1].priority - b[1].priority;
            });
            
            for(var i = 0; i < list.length; i++) {
                this.defaultHaveNeighborRedraw(list[i][0], list[i][1], ignoreNorth, ignoreNorthEast, ignoreEast, ignoreSouthEast, ignoreSouth, ignoreSouthWest, ignoreWest, ignoreNorthWest)
            }
        };

        this.defaultHaveNeighborRedraw = function(
            direction,
            neighbor,
            ignoreNorth,
            ignoreNorthEast,
            ignoreEast,
            ignoreSouthEast,
            ignoreSouth,
            ignoreSouthWest,
            ignoreWest,
            ignoreNorthWest
        ) {
            if(direction === 'north' && !ignoreNorth) {
                                                                                     //cel n     ne    e     se    s      sw    w     nw    nei
                this.mapper.config.cellRenderers[neighbor.type].draw(neighbor, null, true, true, true, true, false, false, false, true, true, true);
            }

            else if(direction === 'east' && !ignoreEast) {
                                                                                     //cel n     ne    e     se     s    sw    w      nw    nei
                this.mapper.config.cellRenderers[neighbor.type].draw(neighbor, null, true, true, true, true, true, true, false, false, false, true);
            }

            else if(direction === 'south' && !ignoreSouth) {
                                                                                     //cel n      ne    e     se    s     sw    w     nw     nei
                this.mapper.config.cellRenderers[neighbor.type].draw(neighbor, null, true, false, false, true, true, true, true, true, false, true);
            }

            else if(direction === 'west' && !ignoreWest) {
                                                                                     //cel n     ne    e      se     s    sw    w     nw    nei
                this.mapper.config.cellRenderers[neighbor.type].draw(neighbor, null, true, true, false, false, false, true, true, true, true, true);
            }
            else if(direction === 'northEast' && !ignoreNorthEast) {
                                                                                     //cel n     ne    e     se     s      sw     w     nw     nei
                this.mapper.config.cellRenderers[neighbor.type].draw(neighbor, null, true, true, true, true, true, true, false, true, true, true);
            }

            else if(direction === 'southEast' && !ignoreSouthEast) {
                                                                                     //cel n     ne    e     se     s      sw     w     nw     nei
                this.mapper.config.cellRenderers[neighbor.type].draw(neighbor, null, true, true, true, true, true, true, true, true, false, true);
            }

            else if(direction === 'southWest' && !ignoreSouthWest) {
                                                                                     //cel n     ne    e     se     s      sw     w     nw     nei
                this.mapper.config.cellRenderers[neighbor.type].draw(neighbor, null, true, true, false, true, true, true, true, true, true, true);
            }

            else if(direction === 'northWest' && !ignoreNorthWest) {
                                                                                     //cel n     ne    e     se     s      sw     w     nw     nei
                this.mapper.config.cellRenderers[neighbor.type].draw(neighbor, null, true, true, true, true, false, true, true, true, true, true);
            }
        }
    };

    window.DefaultRenderer = DefaultRenderer;
}());

(function() {
    var BlankRenderer = function(mapper, type) {
        DefaultRenderer.call(this, mapper, type);
        this.priority = 1;

        this.drawInternal = function(
            cell,
            coords,
            ignoreCell,
            ignoreNorth,
            ignoreNorthEast,
            ignoreEast,
            ignoreSouthEast,
            ignoreSouth,
            ignoreSouthWest,
            ignoreWest,
            ignoreNorthWest,
            ignoreNeighbors
        ) {
            if(!ignoreCell) {
                this.defaultBlankCell(coords);
            }
            this.defaultBlankGridWalls(cell, coords, ignoreNorth, ignoreNorthEast, ignoreEast, ignoreSouthEast, ignoreSouth, ignoreSouthWest, ignoreWest, ignoreNorthWest);
            if(!ignoreNeighbors) {
                this.defaultRedrawNeighbors(cell, ignoreNorth, ignoreNorthEast, ignoreEast, ignoreSouthEast, ignoreSouth, ignoreSouthWest, ignoreWest, ignoreNorthWest);                
            }
        };
    };

    window.BlankRenderer = BlankRenderer;
}());

(function() {
    var WallRenderer = function(mapper, type) {
        DefaultRenderer.call(this, mapper, type);
        this.priority = 2;

        this.drawInternal = function(
            cell,
            coords,
            ignoreCell,
            ignoreNorth,
            ignoreNorthEast,
            ignoreEast,
            ignoreSouthEast,
            ignoreSouth,
            ignoreSouthWest,
            ignoreWest,
            ignoreNorthWest,
            ignoreNeighbors
        ) {
            //Fill the edge
            if(!ignoreCell) {
                alchemy.fillRect(this.mapper.context, coords.x0, coords.y0, coords.x1 - coords.x0 + 1, coords.y1 + 1 - coords.y0, this.mapper.config.wallFillStyle);
            }
            var c = this.neighborCompare(cell, [null]);
            mapper.colorGridWall(cell, coords, !c.north && !ignoreNorth, !c.northEast && !ignoreNorthEast,
                !c.east && !ignoreEast, !c.southEast && !ignoreSouthEast, !c.south && !ignoreSouth,
                !c.southWest && !ignoreSouthWest, !c.west && !ignoreWest, !c.northWest && !ignoreNorthWest,
                 mapper.config.ink.r, mapper.config.ink.g, mapper.config.ink.b, mapper.config.ink.a);
        };
    };

    window.WallRenderer = WallRenderer;
}());

(function() {
    var DoorRenderer = function(mapper, type) {
        DefaultRenderer.call(this, mapper, type);
        this.priority = 3;

        this.drawInternal = function(
            cell,
            coords,
            ignoreCell,
            ignoreNorth,
            ignoreNorthEast,
            ignoreEast,
            ignoreSouthEast,
            ignoreSouth,
            ignoreSouthWest,
            ignoreWest,
            ignoreNorthWest,
            ignoreNeighbors
        ) {
            this.defaultBlankCell(coords);


            var lineWidth = Math.round(this.mapper.config.grid.lineWidth / 2);
            var strokeStyle = mapper.getStyle(mapper.config.ink);
            var angle = Math.PI/2.5
            if(cell.orientation === 'north') {
                this.mapper.colorGridWall(cell, coords, true, false, false, false, false, false, false, false, 255, 255, 255, 0)
                var radius = Math.round(this.mapper.config.cellSize * .8);
                var centerX = coords.x0 + Math.round(this.mapper.config.cellSize * .1);
                var centerY = coords.y0 - Math.round(this.mapper.config.grid.lineWidth / 2);
                alchemy.drawArc(this.mapper.context, centerX, centerY, radius, 0, angle, lineWidth, strokeStyle);
                var circleX = Math.cos(Math.PI/4)*radius + centerX;
                var circleY = Math.sin(Math.PI/4)*radius + centerY;
                alchemy.drawLine(this.mapper.context, centerX, centerY, circleX, circleY, lineWidth, strokeStyle);
                this.mapper.colorGridWall(cell, coords, true, false, false, false, false, false, false, false, mapper.config.ink.style.r, mapper.config.ink.style.g, mapper.config.ink.style.b, mapper.config.ink.style.a, .1);
            }
            if(cell.orientation === 'east') {
                this.mapper.colorGridWall(cell, coords, false, false, true, false, false, false, false, false, 255, 255, 255, 0)
                var radius = Math.round(this.mapper.config.cellSize * .8);
                var centerX = coords.x1 + Math.round(this.mapper.config.grid.lineWidth / 2);
                var centerY = coords.y0 + Math.round(this.mapper.config.cellSize * .1);
                alchemy.drawArc(this.mapper.context, centerX, centerY, radius, Math.PI/2, Math.PI/2 + angle, lineWidth, strokeStyle);
                var circleX = Math.cos(Math.PI/4 + Math.PI/2)*radius + centerX;
                var circleY = Math.sin(Math.PI/4 + Math.PI/2)*radius + centerY;
                alchemy.drawLine(this.mapper.context, centerX, centerY, circleX, circleY, lineWidth, strokeStyle);
                this.mapper.colorGridWall(cell, coords, false, false, true, false, false, false, false, false, mapper.config.ink.style.r, mapper.config.ink.style.g, mapper.config.ink.style.b, mapper.config.ink.style.a, .1);
            }
        };
    };
    window.DoorRenderer = DoorRenderer;
}());

$(function() {
    window.dm = new DungeonMapper('dungeon');
    dm.addRenderer('blank', BlankRenderer);
    dm.addRenderer('fillWall', WallRenderer);
    dm.addRenderer('door', DoorRenderer);
    dm.init();

    var typeInput = $('input[name="selectedType"]');
    var orientationInput = $('input[name="selectedOrientation"]');
    typeInput.val(dm.selectedType);
    orientationInput.val(dm.selectedOrientation);

    $('#update-button').on('click', function() {
        dm.setSelectedType(typeInput.val());
        dm.setSelectedOrientation(orientationInput.val());
    });
});