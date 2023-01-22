/*
  shim layer with setTimeout fallback
  from paul irish:
  http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
*/
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame    ||
    window.oRequestAnimationFrame      ||
    window.msRequestAnimationFrame     ||
    function(/* function */ callback,
      /* DOMElement */ element){
      window.setTimeout(callback, 1000 / 60);
    };
})();

function plinkoinit() {
  $('#plinko-wrapper').hide();
  $('#plinkocanvas').show();

  var canvas = $('#plinkocanvas')[0];
  //canvas.width = 400
  //canvas.height = 400
  var SCALE = 20; // 1 meter = 30 pixels

  var  b2World = Box2D.Dynamics.b2World,
  b2Vec2 = Box2D.Common.Math.b2Vec2,
  b2AABB = Box2D.Collision.b2AABB,
  b2BodyDef = Box2D.Dynamics.b2BodyDef,
  b2Body = Box2D.Dynamics.b2Body,
  b2FixtureDef = Box2D.Dynamics.b2FixtureDef,
  b2Fixture = Box2D.Dynamics.b2Fixture,
  b2MassData = Box2D.Collision.Shapes.b2MassData,
  b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape,
  b2CircleShape = Box2D.Collision.Shapes.b2CircleShape,
  b2DebugDraw = Box2D.Dynamics.b2DebugDraw,
  b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef;

  var world = new b2World(
    new b2Vec2(0, 10), //gravity
    true               //allow sleep
  );

  // a ficture definition defines the properties of the object
  var fixDef = new b2FixtureDef;
  fixDef.density = 1.0;
  fixDef.friction = 0.1;
  fixDef.restitution = 0.2;

  // a body definition defines where it is and how it interacts w/ the world
  var bodyDef = new b2BodyDef;
  bodyDef.type = b2Body.b2_staticBody,
  bodyDef.position.x = canvas.width / 2 / SCALE,
  bodyDef.position.y = canvas.height / SCALE;

  //ground
  fixDef.shape = new b2PolygonShape;
  // half width, half height.
  fixDef.shape.SetAsBox((600 / SCALE) / 2, (10/SCALE) / 2);
  world.CreateBody(bodyDef).CreateFixture(fixDef);


  var marbleRadius = 0.4;
  var pegRadius = 0.1;
  var nrow = 6;
  var ncol = 11;
  var binHeight = 8;
  var binWidth = 10/SCALE;

  //pegs
  fixDef.shape = new b2CircleShape(pegRadius);
  for (var r=0; r < nrow; r++) {
    for (var c=0; c < ncol; c++) {
      bodyDef.position.x = canvas.width / (ncol + 1) * (c + 1) / SCALE;
      bodyDef.position.y = ((canvas.height / SCALE) - binHeight) /
        (nrow + 1) *
        (r + 1);
      world.CreateBody(bodyDef).CreateFixture(fixDef);
    }
  }

  //bins
  for (var c=0; c < ncol + 2; c++) {
    fixDef.shape = new b2PolygonShape;
    fixDef.shape.SetAsBox(binWidth / 2, binHeight / 2);
    bodyDef.position.x = canvas.width / (ncol + 1) * c / SCALE;
    bodyDef.position.y = (canvas.height / SCALE) - (binHeight / 2);
    world.CreateBody(bodyDef).CreateFixture(fixDef);
  }

  //walls
  function drawWall(xpos) {
    fixDef.shape = new b2PolygonShape;
    fixDef.shape.SetAsBox(binWidth / 2, canvas.height / 2 / SCALE);
    bodyDef.position.x = xpos;
    bodyDef.position.y = canvas.height / 2 / SCALE;
    world.CreateBody(bodyDef).CreateFixture(fixDef);
  }
  drawWall(0);
  drawWall(canvas.width / SCALE);

  //falling marble on mouse click
  var isMouseDown

  canvas.addEventListener("mousedown", function(e) {
    isMouseDown = true;
    handleMouseMove(e);
    canvas.addEventListener("mousemove", handleMouseMove, true);
    e.preventDefault();
  }, true);

  canvas.addEventListener("mouseup", function() {
    canvas.removeEventListener("mousemove", handleMouseMove, true);
    isMouseDown = false;
    mouseX = undefined;
    mouseY = undefined;
  }, true);

  //falling marble
  function handleMouseMove(e) {
    bodyDef.type = b2Body.b2_dynamicBody;
    fixDef.shape = new b2CircleShape(marbleRadius);
    bodyDef.position.x = canvas.width / SCALE / 2 + (Math.random()-0.5)*0.1;
    bodyDef.position.y = 0;
    world.CreateBody(bodyDef).CreateFixture(fixDef);
  };

  //setup debug draw
  var debugDraw = new b2DebugDraw();
  debugDraw.SetSprite(canvas.getContext("2d"));
  debugDraw.SetDrawScale(SCALE);
  debugDraw.SetFillAlpha(0.3);
  debugDraw.SetLineThickness(1.0);
  debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
  world.SetDebugDraw(debugDraw);

  //window.setInterval(update, 1000 / 60);

  function update() {
    world.Step(
      1 / 60   //frame-rate
      ,  10       //velocity iterations
      ,  10       //position iterations
    );
    world.DrawDebugData();
    world.ClearForces();

    requestAnimFrame(update);
  }; // update()

  requestAnimFrame(update);
}

$(plinkoinit)
