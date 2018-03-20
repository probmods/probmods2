// Custom code for probmods.org (looks like)

function DrawObject(width, height, visible){
  this.canvas = $('<canvas/>', {
    "class": "drawCanvas",
    "Width": width + "px",
    "Height": height + "px"
  })[0];
  if (visible==true){
    $(this.canvas).css({"display": "inline"});
    var container = wpEditor.makeResultContainer();
    $(container).append(this.canvas);
  };
  this.paper = new paper.PaperScope();
  this.paper.setup(this.canvas);
  this.paper.view.viewSize = new this.paper.Size(width, height);
  this.redraw();
}

DrawObject.prototype.newPath = function(strokeWidth, opacity, color){
  var path = new this.paper.Path();
  path.strokeColor = color || 'black';
  path.strokeWidth = strokeWidth || 8;
  path.opacity = opacity || 0.6;
  return path;
};

DrawObject.prototype.newPoint = function(x, y){
  return new this.paper.Point(x, y);
};

DrawObject.prototype.circle = function(x, y, radius, stroke, fill){
  var point = this.newPoint(x, y);
  var circle = new this.paper.Path.Circle(point, radius || 50);
  circle.fillColor = fill || 'black';
  circle.strokeColor = stroke || 'black';
  this.redraw();
};

DrawObject.prototype.rectangle = function(x1, y1, x2, y2, stroke, fill, opacity){
  var rect = new this.paper.Path.Rectangle(this.newPoint(x1,y1), this.newPoint(x2, y2));
  rect.fillColor = (fill == 'none' ? new paper.Color(1,1,1,0) : (fill || 'white'));
  rect.strokeColor = stroke || 'black';
  rect.opacity = opacity || 1;
  this.redraw();
};


DrawObject.prototype.polygon = function(x, y, n, radius, stroke, fill){
  var point = this.newPoint(x, y);
  var polygon = new this.paper.Path.RegularPolygon(point, n, radius || 20);
  polygon.fillColor = fill || 'white';
  polygon.strokeColor = stroke || 'black';
  polygon.strokeWidth = 4;
  this.redraw();
};

DrawObject.prototype.line = function(x1, y1, x2, y2, strokeWidth, opacity, color){
  var path = this.newPath(strokeWidth, opacity, color);
  path.moveTo(x1, y1);
  path.lineTo(this.newPoint(x2, y2));
  this.redraw();
};

DrawObject.prototype.redraw = function(){
  this.paper.view.draw();
};

DrawObject.prototype.toArray = function(){
  var context = this.canvas.getContext('2d');
  var imgData = context.getImageData(0, 0, this.canvas.width, this.canvas.height);
  return imgData.data;
};

DrawObject.prototype.distanceF = function(f, cmpDrawObject){
  if (!((this.canvas.width == cmpDrawObject.canvas.width) &&
        (this.canvas.height == cmpDrawObject.canvas.height))){
    console.log(this.canvas.width, cmpDrawObject.canvas.width,
                this.canvas.height, cmpDrawObject.canvas.height);
    throw new Error("Dimensions must match for distance computation!");
  }
  var thisImgData = this.toArray();
  var cmpImgData = cmpDrawObject.toArray();
  return f(thisImgData, cmpImgData);
};

DrawObject.prototype.distance = function(cmpDrawObject){
  var df = function(thisImgData, cmpImgData) {
    var distance = 0;
    for (var i=0; i<thisImgData.length; i+=4) {
      var col1 = [thisImgData[i], thisImgData[i+1], thisImgData[i+2], thisImgData[i+3]];
      var col2 = [cmpImgData[i], cmpImgData[i+1], cmpImgData[i+2], cmpImgData[i+3]];
      distance += euclideanDistance(col1, col2);
    };
    return distance;
  };
  return this.distanceF(df, cmpDrawObject)
};

DrawObject.prototype.destroy = function(){
  this.paper = undefined;
  $(this.canvas).remove();
}

function Draw(s, k, a, width, height, visible){
  return k(s, new DrawObject(width, height, visible));
}

function loadImage(s, k, a, drawObject, url){
  // Synchronous loading - only continue with computation once image is loaded
  var context = drawObject.canvas.getContext('2d');
  var imageObj = new Image();
  imageObj.onload = function() {
    var raster = new drawObject.paper.Raster(imageObj);
    raster.position = drawObject.paper.view.center;
    drawObject.redraw();
    resumeTrampoline(function() { return k(s) });
  };
  imageObj.src = url;
}
