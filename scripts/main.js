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
        return typeof strokeStyle !== 'undefined' ? strokeStyle : 'black';
    };

    //Must be the actual canvas
    A.setPixel = function(data, canvasWidth, x, y, r, g, b, a) {        
        var n = (y * canvasWidth + x) * 4;
        data[n] = 255 - r;
        data[n + 1] = 255 - b;
        data[n + 2] = 255 - g;
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
        r = typeof r !== 'undefined' ? r : 255;
        g = typeof g !== 'undefined' ? g : 255;
        b = typeof b !== 'undefined' ? b : 255;
        a = typeof a !== 'undefined' ? a : 1;

        var context = A.getContext(canvas);
        var imgData = context.getImageData(0, 0, canvas.width, canvas.height);
        var data = imgData.data;

        var x0 = startX,
            x1 = endX,
            y0 = startY,
            y1 = endY;
        var dx = Math.abs(x1 - x0),
            sx = x0 < x1 ? 1 : -1;
        var dy = Math.abs(y1 - y0),
            sy = y0 < y1 ? 1 : -1;

        var err = (dx > dy ? dx : -dy) / 2;
        while (true) {
            A.setPixel(data, canvas.width, x0, y0, r, g, b, a);
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
        context.putImageData(imgData, 0, 0);
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
        this.config.templateCell = {
            x : 0,
            y : 0,
            isSelected : false
        };

        //State
        this.dungeon = null;
        this.context = null;
        this.dungeonPixelSize = null;
        this.selectedCell = null;
        this.cells = null;

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

        /**
         * Initialize the dungeon mapper
         */
        this.init = function(dungeonId) {
            this.drawGrid();
            this.initEvents();
        };

        this.initEvents = function() {
            this.dungeon.addEventListener('click', dungeonClickHandler, false);
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
                alchemy.drawBLine(this.dungeon, x, 0, x, this.dungeon.height, 255, 255, 255, .5);
            }
            for (var y = 0; y < this.dungeon.height; y += (this.config.cellSize + this.config.gridLineWidth)) {
                alchemy.drawBLine(this.dungeon, 0, y, this.dungeon.width, y, 255, 255, 255, .5);
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

        this.drawCell = function(cell) {
            var coords = this.getCellInnerCoordinates(cell.x, cell.y);
            var fillStyle = cell.isSelected ? 'rgba(0, 0, 255, .5)' : 'white';
            alchemy.fillRect(this.context, coords.x0, coords.y0, coords.x1 - coords.x0 + 1, coords.y1 + 1 - coords.y0, fillStyle);
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


    }
    window.DungeonMapper = DungeonMapper;
}());

$(function() {
    window.dm = new DungeonMapper('dungeon');
    dm.init();
});