function Cell(x, y, width, height, texture) {
  this.x = x;
  this.y = y; 
  this.width = width;
  this.height = height;
  this.texture = texture
  this.sprite = new PIXI.Sprite(texture);
  this.pathable = true;
}

Cell.prototype.update = function(width, height) {
  this.width = width;
  this.height = height;
  this.sprite.texture = this.texture;
  this.sprite.position.x = this.x * width;
  this.sprite.position.y = this.y * height;
  this.sprite.width = this.width;
  this.sprite.height = this.height;
}

function GameGrid(cols, rows, width, height) {
  this.cols = cols;
  this.rows = rows;
  this.width = width;
  this.height = height;

  this.pathableTexture = PIXI.Texture.fromImage("img/mvp.png");
  this.unPathableTexture = PIXI.Texture.fromImage("img/spltest.png");

  this.stage = new PIXI.Container();
  this.grid = [[]];
  for (var i=0; i<cols; i++) {
    this.grid[i] = [];
    for (var j=0; j<rows; j++) {
      this.grid[i][j] = new Cell(i, j, this.cellDimension("width"), this.cellDimension("height"), this.pathableTexture);
      this.stage.addChild(this.grid[i][j].sprite);
    }
  }
}

GameGrid.prototype.copyTerrain = function(terrainGrid) {
  for (var i=0; i<cols; i++) {
    for (var j=0; j<rows; j++) {
      if (terrainGrid[i][j] == 1)
        this.setUnPathable(i, j);
    }
  }
}

GameGrid.prototype.cellDimension = function(direction) {
  var dimension;
  var numeration;

  if (direction == "width") {
    dimension = this.width;
    numeration = this.cols;
  }
  else {
    dimension = this.height;
    numeration = this.rows;
  }
  return dimension / numeration;
}

GameGrid.prototype.setUnPathable = function(x, y) {
  this.grid[x][y].pathable = false;
  this.grid[x][y].texture = this.unPathableTexture;
}

GameGrid.prototype.update = function() {
  var classThis = this;
  this.grid.forEach(function(column) {
    column.forEach(function(cell) {
      cell.update(classThis.cellDimension("width"), classThis.cellDimension("height"));
    });
  });
}
