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

    //Must be the actual canvas
    A.setPixel = function(data, canvasWidth, x, y, r, g, b, a) {        
        var n = (y * canvasWidth + x) * 4;
        data[n] = r;
        data[n + 1] = b;
        data[n + 2] = g;
        data[n + 3] = Math.round(a * 255);
    }

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
        this.config = {};
        this.config.width = 20; //extra one is for the right most gird line
        this.config.height = 20;
        this.config.cellSize = 20; //Number of pixel WHITESPACE
        this.config.gridLineWidth = 1;
        this.config.emptyFillStyle = 'rgba(255, 255, 255, 1)';
        this.config.highlightFillStyle = 'rgba(0, 0, 255, .5)'
        this.config.wallFillStyle = 'rgba(0, 0, 0, 1)';
        this.config.grid = {};
        this.config.grid.style = {};
        this.config.grid.style.r = 0;
        this.config.grid.style.g = 0;
        this.config.grid.style.b = 0;
        this.config.grid.style.a = .25;
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
            type : null
        };

        //State
        this.dungeon = null;
        this.context = null;
        this.dungeonPixelSize = null;
        this.selectedCell = null;
        this.cells = null;
        this.selectedType = null;

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

        var dungeonClickHandler = function(event) {
            var coordinates  = this.mapper.getClickEventCoordinates(event);
            var cellPosition = this.mapper.getCellPosition(coordinates.x, coordinates.y);
            var previouslySelectedCell = this.mapper.selectedCell;
            
            this.mapper.selectedCell = this.mapper.getCell(cellPosition.x, cellPosition.y);
            this.mapper.selectedCell.isSelected = true;
            if(previouslySelectedCell !== null) {
                previouslySelectedCell.isSelected = false;     
                this.mapper.drawCell(previouslySelectedCell);           
            }
            this.mapper.drawCell(this.mapper.selectedCell);
        };

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
                  
                for(var i in mapper.selection.selectedCells) {
                    mapper.selection.selectedCells[i].type  = mapper.selectedType;
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
            this.dungeon.addEventListener('click', dungeonClickHandler, false);
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

            for (var x = 0; x < this.dungeon.width; x += (this.config.cellSize + this.config.gridLineWidth)) {
                alchemy.drawBLine(this.dungeon, x, 0, x, this.dungeon.height, this.config.grid.style.r, this.config.grid.style.g, this.config.grid.style.b, this.config.grid.style.a);
            }
            for (var y = 0; y < this.dungeon.height; y += (this.config.cellSize + this.config.gridLineWidth)) {
                alchemy.drawBLine(this.dungeon, 0, y, this.dungeon.width, y, this.config.grid.style.r, this.config.grid.style.g, this.config.grid.style.b, this.config.grid.style.a);
            }
        };

        this.getCell = function(x, y) {
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

        this.drawCell = function(cell) {
            //CHECK FOR SESSION
            if(this.drawSession.started) {
                if(this.drawSession.drawnCells.has(cell)) {
                    return; //ignore cell
                }
            }

            var coords = this.getCellInnerCoordinates(cell.x, cell.y);

            alchemy.fillRect(this.context, coords.x0, coords.y0, coords.x1 - coords.x0 + 1, coords.y1 + 1 - coords.y0, this.config.emptyFillStyle);
            if(cell.isHighlighted) {
                alchemy.fillRect(this.context, coords.x0, coords.y0, coords.x1 - coords.x0 + 1, coords.y1 + 1 - coords.y0, this.config.highlightFillStyle);
            }

            if(cell.type !== null) {
                var functionName = 'draw' + cell.type.charAt(0).toUpperCase() + cell.type.slice(1);
                this[functionName](cell, coords);
            }

            //END
            if(this.drawSession.started) {
                this.drawSession.drawnCells.add(cell);
            }
        };

        this.getDungeonPixelSize = function() {
            //The plus one is for the extra line on the end
            var pixelWidth = this.config.width * this.config.cellSize + (this.config.width + 1) * this.config.gridLineWidth;
            var pixelHeight = this.config.height * this.config.cellSize + (this.config.height + 1) * this.config.gridLineWidth; 
            return {
                width : pixelWidth,
                height : pixelHeight
            };
        };

        this.getCellPosition = function(x, y) {

            var xCell = Math.floor(x / (this.config.gridLineWidth + this.config.cellSize));
            var yCell = Math.floor(y / (this.config.gridLineWidth + this.config.cellSize));

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
            var x0 = (x + 1) * this.config.gridLineWidth + x * this.config.cellSize;
            var y0 = (y + 1) * this.config.gridLineWidth + y * this.config.cellSize;
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

        this.setSelectedType = function(type) {
            this.selectedType = type;
        };

        this.inkGridWall = function(cell, coords, north, south, east, west) {
            
        };

        //Specific draw methods
        this.drawWall = function(cell, coords) {
            alchemy.fillRect(this.context, coords.x0, coords.y0, coords.x1 - coords.x0 + 1, coords.y1 + 1 - coords.y0, this.config.wallFillStyle);
        };
    }
    window.DungeonMapper = DungeonMapper;
}());

$(function() {
    window.dm = new DungeonMapper('dungeon');
    dm.init();
});