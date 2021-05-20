---
layout: exercise
title: Bayesian principles of object perception
custom_js:
- assets/js/draw.js
- assets/js/paper-full.js
---

Below is a version of the simple object-based-vision model from the chapter, extended a bit to allow longer movies, more colors, etc.

~~~~
var xSize = 4, ySize = 2
var background = _.flatten(map(function(x){map(function(y){return {x:x,y:y,color:0}},
                                                   _.range(ySize))},_.range(xSize)))
//helper to make picture of the movie frames, for fun:
var drawMovie = function(movie){
  var canvas = Draw(movie.length*20*(xSize+2), 20*(ySize+1), true);
  var colormap = ['black','red','green','blue']
  var drawImage = function(frame,image) {
    var offset = frame*20*(xSize+2)
    map(function(p){canvas.rectangle(offset+20*p.x,20*p.y,offset+20*(p.x+1),20*(p.y+1),1,colormap[p.color])},image)
  }
  mapIndexed(drawImage,movie)
}

// layer an object onto a "background" image. Note that the object occludes the background.
var layer = function(object, image) {
  return map(function(pixel){
    var hitsObject = (pixel.x >= object.xLoc) &&
        (pixel.x < (object.xLoc+object.hSize)) &&
        (pixel.y >= object.yLoc) &&
        (pixel.y < (object.yLoc+object.vSize))
    var color = hitsObject ? object.color : pixel.color
    return {x:pixel.x, y:pixel.y, color: color}
  }, image)
}

var colors = 1
var vsizes = 2
// prior distribution over objects' properties:
var sampleProperties = function() {
  return {xLoc: randomInteger(xSize), yLoc: randomInteger(ySize),
          hSize: 1, vSize: randomInteger(vsizes)+1, 
          color: randomInteger(colors)+1}
}

// motion model: the object drifts left or right with some probability.
var move = function(obj) {
  var v = categorical({vs: [-1, 0, 1], ps: [0.3, 0.4, 0.3]})
  return extend(obj, {xLoc: obj.xLoc + v})
}

var movie = function(objs, t) {
  var frame = reduce(layer, background, objs)
  if (t==1) {return [frame]}
  var nextobjs = map(function(obj){move(obj)}, objs)
  return [frame].concat(movie(nextobjs,t-1))
}


var numObjects = function(observedMovie){ 
  Infer({method: 'enumerate'}, function() {
    var frames = observedMovie.length
    var numObjects = randomInteger(2)+1
    var objs = repeat(numObjects,sampleProperties)
    var m = movie(objs,frames)
    condition(_.isEqual(m, observedMovie))
    return {numObjects}
})}

var obsMovie = [layer({xLoc:1,yLoc:0,hSize:1,vSize:2,color:1},background),
                layer({xLoc:2,yLoc:0,hSize:1,vSize:2,color:1},background),
                layer({xLoc:3,yLoc:0,hSize:1,vSize:2,color:1},background)]
drawMovie(obsMovie)

viz.table(numObjects(obsMovie))
~~~~

Explore how the strength of the Occam's razor (i.e. the preference for one object over two) depends on various aspects of the simulation:

- size of the frames (number of pixels),
- number of possible object colors,
- number of (ambiguous) frames in the movie,
- the motion model for objects (e.g. how much drift is expected),
- what other aspects could you change?

This simulation is inspired by the experiments from
[Principles of object perception](https://onlinelibrary.wiley.com/doi/abs/10.1207/s15516709cog1401_3), Spelke (1990), on infant object perception. In that paper, Spelke found that shared motion but not shared static properties would make 4mo infants expect a single object from two pieces (ibid Fig. 2). (Indeed, shared motion even among two perceptually different pieces led infants to infer a single object.) How are the results of your simulation consistent with these findings (or not)?

Based on your simulations above, would you predict that perceptual similarity could overcome common motion in any circumstances?

## Other latent properties

The above exploration focussed on inferring the unobservable property of connectedness -- whether two pieces part of a single object. We can make similar inferences about other latent properties of objects, as long as they impact the observed movie.

Below we've assigned a `drift` property to each object that governs its motion dynamics: does it tend to drift left, right or neutral. (We've also simplified by assuming a single object.)

~~~~
var xSize = 4, ySize = 2
var background = _.flatten(map(function(x){map(function(y){return {x:x,y:y,color:0}},
                                                   _.range(ySize))},_.range(xSize)))

// layer an object onto a "background" image. Note that the object occludes the background.
var layer = function(object, image) {
  return map(function(pixel){
    var hitsObject = (pixel.x >= object.xLoc) &&
        (pixel.x < (object.xLoc+object.hSize)) &&
        (pixel.y >= object.yLoc) &&
        (pixel.y < (object.yLoc+object.vSize))
    var color = hitsObject ? object.color : pixel.color
    return {x:pixel.x, y:pixel.y, color: color}
  }, image)
}

var colors = 1
var vsizes = 2
// prior distribution over objects' properties:
var sampleProperties = function() {
  return {xLoc: randomInteger(xSize), yLoc: randomInteger(ySize),
          hSize: 1, vSize: 1, 
          color: 1,
          drift: randomInteger(3)-1}
}

// motion model: the object drifts left or right with some probability.
var move = function(obj) {
  var v = categorical({vs: [-1, 0, 1], ps: [0.3, 0.4, 0.3]})
  return extend(obj, {xLoc: obj.xLoc + v + obj.drift})
}

var movie = function(objs, t) {
  var frame = reduce(layer, background, objs)
  if (t==1) {return [frame]}
  var nextobjs = map(function(obj){move(obj)}, objs)
  return [frame].concat(movie(nextobjs,t-1))
}


var numObjects = function(observedMovie){ 
  Infer({method: 'enumerate'}, function() {
    var frames = observedMovie.length
    var numObjects = 1
    var objs = repeat(numObjects,sampleProperties)
    var m = movie(objs,frames)
    condition(_.isEqual(m, observedMovie))
    return {drift: objs[0].drift}
})}


viz.table(numObjects([layer({xLoc:1,yLoc:0,hSize:1,vSize:1,color:1},background),
                      layer({xLoc:2,yLoc:0,hSize:1,vSize:1,color:1},background),
                      layer({xLoc:3,yLoc:0,hSize:1,vSize:1,color:1},background)]))
~~~~

As you see, it is possible this object has neutral drift -- but it would be a suspicious coincidence that it moves consistently to the right.

Following this line of thinking, add a property `animate` to objects. If the object is not animate it drifts randomly as before. Write a new motion model for animate objects so that they move toward a goal location on each time step -- but they can move at most one position at a time and are a bit noisy in doing so.

When will you model decide that a moving pixel is best explained by animacy? How does this match with your intuitions?

