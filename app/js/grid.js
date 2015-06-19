var passableTexture = PIXI.Texture.fromImage("img/passable.png");
var unpassableTexture = PIXI.Texture.fromImage("img/unpassable.png");
function Cell(x, y, width, height, passable) {
  this.x = x; this.y = y;
  this.passable = passable || false;
  this.enabled = false;
  this.sprite = new PIXI.Sprite(passable ? passableTexture : unpassableTexture);
  this.sprite.width = width; this.sprite.height = height;
  this.sprite.anchor.x = this.sprite.anchor.y = 0.5;
  this.sprite.rotation = Math.floor(Math.random() * 4) * Math.PI / 2; // random orientation
}

Cell.prototype.enable = function(stage) {
  if (this.enabled) { return; }
  stage.addChild(this.sprite);
  this.enabled = true;
}
Cell.prototype.disable = function(stage) {
  if (!this.enabled) { return; }
  stage.removeChild(this.sprite);
  this.enabled = false;
}

Cell.prototype.setPassable = function Cell_setPassable(passable) {
  this.passable = passable;
  this.sprite.texture = passable ? passableTexture : unpassableTexture;
}

Cell.prototype.setScale = function Cell_setScale(cellX, cellY) {
  this.sprite.position.x = (this.x + 0.5) * cellX; this.sprite.position.y = (this.y + 0.5) * cellY;
  this.sprite.width = cellX; this.sprite.height = cellY;
}

function GameGrid(rows, cols, width, height) {
  this.cols = cols; this.rows = rows;
  this.width = width; this.height = height;

  this.stage = new PIXI.Container();
  this.grid = [];
  var cellX = this.width / this.cols, cellY = this.height / this.rows;
  for (var i = 0; i < cols; i ++) {
    var column = this.grid[i] = [];
    for (var j = 0; j < rows; j ++) {
      column[j] = new Cell(i, j, cellX, cellY);
      column[j].enable(this.stage);
    }
  }
}

GameGrid.prototype.copyTerrain = function(terrainGrid) {
  this.grid.forEach(function(column, i) {
    var terrainRow = terrainGrid[i];
    column.forEach(function(cell, j) {
      cell.setPassable(terrainRow[j] === 0);
    });
  });
}

GameGrid.prototype.update = function() {
  var classThis = this;
  var cellX = this.width / this.cols, cellY = this.height / this.rows;
  this.grid.forEach(function(column) {
    column.forEach(function(cell) { cell.setScale(cellX, cellY); });
  });
}
