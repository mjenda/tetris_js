function get(id) {
    return document.getElementById(id);
}

function getGameCanvas() {
     return get("game");
}

class Painter {
     constructor(id) {
        this.id = id;
    }
    drawSquare(startX, startY, size, color) {
        this.getContext().beginPath();
        this.getContext().rect(startX,startY,size,size);
        this.getContext().fillStyle = color;
        this.getContext().lineWidth = 0.4;
        this.getContext().fill();
        this.getContext().stroke();
        this.getContext().closePath();
    }

    drawBox(boxIndexX, boxIndexY, color) {
        this.drawSquare(boxIndexX*40, boxIndexY*40, 40, color);
    }

    drawTile(tile) {
        this.drawBox(tile.x, tile.y, tile.color);
    }

    drawStructure(structure) {
        for (var i = 0; i < structure.tiles.length; ++i) {
            this.drawTile(structure.tiles[i]);
        }
    }

    drawArray(array) {
        for (var i = 0; i < array.length; ++i) {
            this.drawTile(array[i]);
        }
    }

    clearCanvas() {
        this.getContext().clearRect(0, 0, this.getCanvas().width, this.getCanvas().height);
        var w = this.getCanvas().width;
        this.getCanvas().width = 1;
        this.getCanvas().width = w;
    }
    getContext() {
        return this.getCanvas().getContext('2d');
    }
    getCanvas() {
         return get(this.id);
    }
}

class Tile {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
    }
    moveLeft() {
        this.x = this.x - 1;
    }
    moveRight() {
        this.x = this.x + 1;
    }
    moveDown() {
        this.y = this.y + 1;
    }
    moveUp() {
        this.y = this.y - 1;
    }
    touchedTheBottomBorder() {
        return (this.y + 1)*40 > getGameCanvas().height;
    }
    touchedTheRightBorder() {
        return (this.x + 1)*40 > getGameCanvas().width;
    }
    touchedTheLeftBorder() {
        return this.x  < 0;
    }
}

class Block {
    constructor() {
        this.tiles = [];
        this.possibleRotations = 4;
        this.currentRotation = 0;
        this.rotation = [[[0,0,0,0],[0,0,0,0]],
                         [[0,0,0,0],[0,0,0,0]],
                         [[0,0,0,0],[0,0,0,0]],
                         [[0,0,0,0],[0,0,0,0]]];
    }

    moveLeft() {
       for (var i = 0; i < this.tiles.length; ++i) {
          this.tiles[i].moveLeft();
       }
    }
    moveRight() {
       for (var i = 0; i < this.tiles.length; ++i) {
          this.tiles[i].moveRight();
       }
    }
    moveDown() {
       for (var i = 0; i < this.tiles.length; ++i) {
          this.tiles[i].moveDown();
       }
    }
    moveUp() {
        for (var i = 0; i < this.tiles.length; ++i) {
            this.tiles[i].moveUp();
        }
    }
    rotate(bottomLayer) {
        this.currentRotation = (this.currentRotation + 1) % this.possibleRotations;
        for (var i = 0; i < this.tiles.length; ++i) {
            this.tiles[i].x = this.tiles[i].x + this.rotation[this.currentRotation][0][i];
            this.tiles[i].y = this.tiles[i].y + this.rotation[this.currentRotation][1][i];
        }
    }

    unrotate(bottomLayer) {
        this.rotate();
        this.rotate();
        this.rotate();
    }

    rotateIfPossible(bottomLayer) {
         this.rotate();
         if (this.touchedTheBottomBorder() ||
             this.touchedTheLeftBorder() ||
             this.touchedTheRightBorder() ||
             this.touchedTheGround(bottomLayer)) {
                  this.unrotate();
         }
    }
    moveDownIfPossible(bottomLayer) {
        this.moveDown();
        if (this.touchedTheBottomBorder()) {
             this.moveUp();
             return;
        }
        for (var i = 0; i < bottomLayer.length; ++i) {
            if (this.isColidingWithBottomLayer(bottomLayer)) {
               this.moveUp();
               return;
            }
        }
    }
    moveLeftIfPossible(bottomLayer) {
        this.moveLeft();
        if (this.touchedTheLeftBorder()) {
             this.moveRight();
             return;
        }
        for (var i = 0; i < bottomLayer.length; ++i) {
            if (this.isColidingWithBottomLayer(bottomLayer)) {
               this.moveRight();
               return;
            }
        }
    }
    moveRightIfPossible(bottomLayer) {
        this.moveRight();
        if (this.touchedTheRightBorder()) {
             this.moveLeft();
             return;
        }
        for (var i = 0; i < bottomLayer.length; ++i) {
            if (this.isColidingWithBottomLayer(bottomLayer)) {
                 this.moveLeft();
                 return;
            }
        }
    }
    touchedTheGround(bottomLayer) {
        this.moveDown();
        var result = this.touchedTheBottomBorder() || this.isColidingWithBottomLayer(bottomLayer);
        this.moveUp();
        return result;
    }
    touchedTheBottomBorder() {
        for (var i = 0; i < this.tiles.length; ++i) {
            if (this.tiles[i].touchedTheBottomBorder()) {
               return true;
            }
        }
        return false;
    }
    touchedTheRightBorder() {
        for (var i = 0; i < this.tiles.length; ++i) {
            if (this.tiles[i].touchedTheRightBorder()) {
               return true;
            }
        }
        return false;
    }
    touchedTheLeftBorder() {
        for (var i = 0; i < this.tiles.length; ++i) {
            if (this.tiles[i].touchedTheLeftBorder()) {
               return true;
            }
        }
        return false;
    }
    isColidingWithBottomLayer(bottomLayer) {
        for (var i = 0; i < this.tiles.length; ++i) {
            for (var j = 0; j < bottomLayer.length; ++j) {
               if (this.tiles[i].x == bottomLayer[j].x &&
                    this.tiles[i].y == bottomLayer[j].y) {
                    return true;
               }
            }
        }
        return false;
    }
}

class BlockS extends Block {
    constructor (x, y, color) {
        super();
        this.tiles = [ new Tile(x+1, y+1,   color),
                       new Tile(x+2, y+1, color),
                       new Tile(x,   y+2, color),
                       new Tile(x+1, y+2, color)];
        this.rotation = [[[-1,0,-1,0],[0,-1,2,1]],
                         [[-1,-2,1,0],[0,-1,0,-1]],
                         [[1,2,-1,0],[-1,0,-1,0]],
                         [[1,0,1,0],[1,2,-1,0]]];
    }
}

class BlockZ extends Block {
    constructor (x, y, color) {
        super();
        this.tiles = [ new Tile(x,   y+1,   color),
                       new Tile(x+1, y+1,   color),
                       new Tile(x+1, y+2, color),
                       new Tile(x+2, y+2, color)];
        this.rotation = [[[-2,-1,0,1],[1,0,1,0]],
                         [[1,0,-1,-2],[-1,0,-1,0]],
                         [[1,0,1,0],[1,0,-1,-2]],
                         [[0,1,0,1],[-1,0,1,2]]];
    }
}

class BlockL extends Block {
    constructor (x, y, color) {
        super();
        this.tiles = [ new Tile(x+1, y,   color),
                       new Tile(x+1, y+1, color),
                       new Tile(x+1, y+2, color),
                       new Tile(x+2, y+2, color)];
        this.rotation = [[[1,0,-1,0],[-1,0,1,2]],
                         [[1,0,-1,-2],[1,0,-1,0]],
                         [[-1,0,1,0],[1,0,-1,-2]],
                         [[-1,0,1,2],[-1,0,1,0]]];
    }
}

class BlockI extends Block {
    constructor (x, y, color) {
        super();
        this.tiles = [ new Tile(x,   y+1, color),
                       new Tile(x+1, y+1, color),
                       new Tile(x+2, y+1, color),
                       new Tile(x+3, y+1, color)];
        this.rotation = [[[-1,0,1,2],[1,0,-1,-2]],
                         [[2,1,0,-1],[-1,0,1,2]],
                         [[-2,-1,0,1],[2,1,0,-1]],
                         [[1,0,-1,-2],[-2,-1,0,1]]];
    }
}

class BlockO extends Block {
    constructor (x, y, color) {
        super();
        this.tiles = [ new Tile(x,   y,   color),
                       new Tile(x+1, y,   color),
                       new Tile(x,   y+1, color),
                       new Tile(x+1, y+1, color)];
    }
}

class BlockT extends Block {
    constructor (x, y, color) {
        super();
        this.tiles = [ new Tile(x,   y+1,   color),
                       new Tile(x+1, y+1,   color),
                       new Tile(x+2, y+1,   color),
                       new Tile(x+1, y+2, color)];
        this.rotation = [[[-1,0,1,-1],[-1,0,1,1]],
                         [[1,0,-1,-1],[-1,0,1,-1]],
                         [[1,0,-1,1],[1,0,-1,-1]],
                         [[-1,0,1,1],[1,0,-1,1]]];
    }
}

class BlockBuilder {
    static buildS(x, y, color) {
        return new BlockS(x, y, color);
    }
    static buildZ(x, y, color) {
        return new BlockZ(x, y, color);
    }
    static buildL(x, y, color) {
        return new BlockL(x, y, color);
    }
    static buildI(x, y, color) {
        return new BlockI(x, y, color);
    }
    static buildO(x, y, color) {
        return new BlockO(x, y, color);
    }
    static buildT(x, y, color) {
        return new BlockT(x, y, color);
    }
}

class RandomizedBlockPicker {
    static pickBlock(x, y) {
        return this.pickType(x, y, this.pickColor());
    }
    static pickType(x, y, color) {
        var randomBlockNumber = Math.floor((Math.random() * 10) + 1) % 6;
        switch(randomBlockNumber) {
            case 0:
               return BlockBuilder.buildS(x, y, color);
               break;
            case 1:
               return BlockBuilder.buildZ(x, y, color);
               break;
            case 2:
               return BlockBuilder.buildL(x, y, color);
               break;
            case 3:
               return BlockBuilder.buildI(x, y, color);
               break;
            case 4:
               return BlockBuilder.buildO(x, y, color);
               break;
            case 5:
               return BlockBuilder.buildT(x, y, color);
               break;
        }
    }
    static pickColor() {
        var randomColorNumber = Math.floor((Math.random() * 10) + 1) % 6;
        switch(randomColorNumber) {
            case 0:
               return "red";
               break;
            case 1:
               return "blue";
               break;
            case 2:
               return "yellow";
               break;
            case 3:
               return "green";
               break;
            case 4:
               return "purple";
               break;
            case 5:
               return "orange";
               break;
        }
    }
}

class KeyboardHandler {
    constructor(game) {
        this.game = game;
        document.addEventListener('keydown', function(event) {
            if (game.isGameOver()) {
                 if (event.keyCode == 13) {
                      game.startNewGame();
                 }
                 return; }
            if(event.keyCode == 37) {
               game.moveLeftAndRedraw();
            }
            else if(event.keyCode == 39) {
               game.moveRightAndRedraw();
            }
            else if (event.keyCode == 40) {
               game.moveDownAndRedraw();
            }
            else if (event.keyCode == 38) {
               game.rotateAndRedraw();
            }
            else if (event.keyCode == 13) {
               game.startNewGame();
            }
        });
    }
}

class Game {
    constructor() {
        this.keyboardHandler = new KeyboardHandler(this);
        this.gameCanvasPainter = new Painter("game");
        this.infoCanvasPainter = new Painter("info");
        this.startNewGame();
    }
    moveDownAndRedraw() {
        if (this.activeBlock.touchedTheGround(this.bottomLayer)) {
            this.gameCanvasPainter.clearCanvas();
            this.infoCanvasPainter.clearCanvas();
            this.morphBlockIntoGround();
            this.clearLineIfPossible();
            this.gameOverOrSpawnNewActiveBlock();
            this.redraw();
            return;
        }

        this.gameCanvasPainter.clearCanvas();
        this.activeBlock.moveDownIfPossible(this.bottomLayer);
        this.redraw();
    }

    moveLeftAndRedraw() {
        this.gameCanvasPainter.clearCanvas();
        this.activeBlock.moveLeftIfPossible(this.bottomLayer);
        this.redraw();
    }

    moveRightAndRedraw() {
        this.gameCanvasPainter.clearCanvas();
        this.activeBlock.moveRightIfPossible(this.bottomLayer);
        this.redraw();
    }

    rotateAndRedraw() {
        this.gameCanvasPainter.clearCanvas();
        this.activeBlock.rotateIfPossible(this.bottomLayer);
        this.redraw();
    }
    morphBlockIntoGround() {
        for (var i = 0; i < this.activeBlock.tiles.length; ++i) {
            this.bottomLayer.push(this.activeBlock.tiles[i]);
        }
    }
    clearLineIfPossible() {
        for (var i = 0; i < 20; i++) {
            var count = this.bottomLayer.filter(function(a){return a.y == i}).length;
            if (count == 10) {
               this.bottomLayer = this.bottomLayer.filter(function(item) {return item.y != i; });
               this.bottomLayer.forEach(function(item) { if (item.y < i) item.moveDown();});
            }
        }
    }
    gameOverOrSpawnNewActiveBlock() {
         if (this.getHighestLayerElemY() <= 3) {
             console.log("Game over!");
             this.activeBlock = null;
             this.nextActiveBlock = null;
             return;
         }
         this.spawnNewActiveBlock();
    }
    spawnNewActiveBlock() {
        this.activeBlock = this.nextActiveBlock;
        this.activeBlock.moveRight();
        this.activeBlock.moveRight();
        this.activeBlock.moveRight();
        this.nextActiveBlock = RandomizedBlockPicker.pickBlock(0,0);
    }
    getHighestLayerElemY() {
         return this.bottomLayer.reduce((min, p) => p.y < min ? p.y : min, this.bottomLayer[0].y);
    }
    redraw() {
        this.gameCanvasPainter.drawArray(this.bottomLayer);
        if (! this.isGameOver()) {
             this.infoCanvasPainter.drawStructure(this.nextActiveBlock);
             this.gameCanvasPainter.drawStructure(this.activeBlock);
        }
    }
    isGameOver() {
         return this.activeBlock == null;
    }
    startNewGame() {
         this.gameCanvasPainter.clearCanvas();
         this.infoCanvasPainter.clearCanvas();
         this.activeBlock = RandomizedBlockPicker.pickBlock(3,0);
         this.nextActiveBlock = RandomizedBlockPicker.pickBlock(0,0);
         this.bottomLayer = [];
         this.redraw();
    }

}

var game = new Game();

function run() {
    var now = Date.now();
    var last = now;
    function frame() {
       now = Date.now();
       if ((now - last) >= 1000) {
            if (!game.isGameOver()) {
                 game.moveDownAndRedraw();
            }
            last = now;
       }
       window.requestAnimationFrame(frame);
    }
    window.requestAnimationFrame(frame);
}

run(game);
