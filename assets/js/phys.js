var fps = 60;
var mspf = 1000/fps;
var lastTime = 0;
if (!requestAnimationFrame) {
  requestAnimationFrame = function(callback, element) {
    var currTime = new Date().getTime();
    var timeToCall = Math.max(0, mspf/2 - (currTime - lastTime));  //run twice as fast...
    var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                               timeToCall);
    lastTime = currTime + timeToCall;
    return id;
  }

  cancelAnimationFrame = function(id) {
    clearTimeout(id);
  };

};

var requestId;

function stopAnim() {
  if (requestId) {
    window.cancelAnimationFrame(requestId);
    requestId = undefined;
  }
}

var SCALE = 30; // 1 meter = 30 pixels
worldWidth = 350;
worldHeight = 500;

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

// same fixture definition for all objects
var fixDef = new b2FixtureDef;
fixDef.density = 1.0;
fixDef.friction = 0.2;
fixDef.restitution = 0.1;

var bodyDef = new b2BodyDef;
bodyDef.angle = 0;

var listToArray = function(list, recurse) {
	if (recurse) {
		return list.slice(0, -1).map(function (x) {return Array.isArray(x) ? listToArray(x) : x});
	} else {
		return list.slice(0, -1);
	}
};

var arrayToList = function(arr, mutate) {
	if (mutate) {
		arr.push(null);
	} else {
		arr = arr.concat(null);
	}
	return arr;
};


// function listToArray(list, recurse) {
// 	var array = [];
// 	while (list.length > 0) {
// 		var left = list[0];
// 		array.push((Array.isArray(left) && recurse) ? listToArray(left) : left);
// 		list = list[1];
// 	}
// 	return array;
// }

var the_empty_list = [];

// function arrayToList(arr) {
// 	if (arr.length == 0) {
// 		return the_empty_list;
// 	} else {
// 		return [arr[0], arrayToList(arr.slice(1))];
// 	}
// }

function clearWorld() {
  var count = world.GetBodyCount();
  for (var i=0; i<count; i++) {
    var body = world.GetBodyList();
    world.DestroyBody(body);
  }
}

//take church world maker and apply it to the box2d world
function applyWorld(initialWorld) {
  //var worldList = churchWorld_to_jsWorld(initialWorld);
  var worldList = initialWorld;
  for (var i=0; i<worldList.length; i++) {
    var worldObj = worldList[i];
    var shapeProps = worldObj[0];
    var shape = shapeProps[0];
    var isStatic = shapeProps[1];
    var dims = shapeProps[2];
    var position = worldObj[1];
    if (worldObj.length > 2) {
      var velocity = worldObj[2];
    } else {
      var velocity = [0,0];
    }
    if (isStatic) {
      bodyDef.type = b2Body.b2_staticBody;
    } else {
      bodyDef.type = b2Body.b2_dynamicBody;
    }
    if (shape == "circle") {
      var r = dims[0] / SCALE;
      fixDef.shape = new b2CircleShape(r);
    } else if (shape == "rect") {
      var w = dims[0] / SCALE;
      var h = dims[1] / SCALE;
      fixDef.shape = new b2PolygonShape;
      fixDef.shape.SetAsBox(w, h);
    } else {
      console.log("error 0");
    }
    bodyDef.position.x = position[0] / SCALE;
    bodyDef.position.y = position[1] / SCALE;
    bodyDef.linearVelocity.x = velocity[0] / SCALE;
    bodyDef.linearVelocity.y = velocity[1] / SCALE;
    world.CreateBody(bodyDef).CreateFixture(fixDef);
    /*if (shape == "rect") {
      console.log(myShape.GetBody().GetFixtureList().GetShape().GetVertices());
    }*/
  }
  return initialWorld;
}

function jsWorld_to_churchWorld(world) {
  return arrayToList(world.map(function(object) {
    return arrayToList(object.map(function(property) {
      return arrayToList(property.map(function(element) {
        if (Object.prototype.toString.call(element) === '[object Array]') {
          return arrayToList(element);
        } else {
          return element;
        }
      }));
    }));
  }));
}

function churchWorld_to_jsWorld(world) {
  return listToArray(world).map(function(object) {
    var object = listToArray(object).map(function(property) {
      return listToArray(property);
    });
    object[0][2] = listToArray(object[0][2]);
    return object;
  });
}

function churchWorld_from_bodyList(body) {
  var worldList = [];
  while (body) {
    var isStatic;
    if (body.GetType() == 2) {
      var isStatic = false;
    } else {
      var isStatic = true;
    }
    var shapeInt = body.GetFixtureList().GetType();
    var shape;
    var dims;
    if (shapeInt == 0) {
      shape = "circle";
      dims = [body.GetFixtureList().GetShape().GetRadius() * SCALE];
    } else {
      shape = "rect";
      vertices = body.GetFixtureList().GetShape().GetVertices();
      dims = [vertices[2].x * 2 * SCALE, vertices[2].y * 2 * SCALE];
    }
    var x = body.GetPosition().x * SCALE;
    var y = body.GetPosition().y * SCALE;
    worldList.push([ [shape, isStatic, dims], [x, y] ]);
    body = body.GetNext();
  }
  //return jsWorld_to_churchWorld(worldList);
  return worldList;
}

function getDynamicObjPositions(churchWorld) {
  var worldList = churchWorld_to_jsWorld(churchWorld);
  var positions = [];
  for (var i=0; i<worldList.length; i++) {
    var worldObj = worldList[i];
    var isStatic = worldObj[0][1];
    if (isStatic == false) {
      positions.push(worldObj[1]);
    }
  }
  return positions;
}

emptyWorld = arrayToList([]);

//now in church
/*_plinkoWhichBin = function(finalWorld, ncol) {
  var positions = getDynamicObjPositions(finalWorld);
  var x = positions[0][0];
  return Math.round(x / (_worldWidth / ncol));
}*/

plinkoWorld = function(nrow, ncol) {
  var pegRadius = 3;
  var wallWidth = 5;
  var binHeight = 120;
  //ground
  var ground = [ [ "rect", true, [worldWidth, wallWidth] ],
                 [ worldWidth / 2, worldHeight ]];
  //pegs
  var pegs = [];
  var pegShapeProperties = ["circle", true, [pegRadius]];
  for (var r=0; r<nrow; r++) {
    for (var c=0; c<ncol; c++) {
      var xpos = worldWidth / (ncol + 1) * (c + 1);
      var ypos = (worldHeight - binHeight) / (nrow + 2) * (r+1);
      pegs.push([ pegShapeProperties,
                  [ xpos, ypos]]);}}
  //walls
  var wallShapeProperties = ["rect", true, [wallWidth, worldHeight]];
  function wall(xpos) {return [wallShapeProperties, [xpos, worldHeight / 2]];}
  var walls = [wall(0), wall(worldWidth)];
  //bins
  var bins = [];
  var binShapeProperties = ["rect", true, [wallWidth, binHeight]];
  var ypos = worldHeight - (binHeight/2);
  for (var c=0; c < ncol + 2; c++) {
    var xpos = _worldWidth / (ncol+1) * c;
    bins.push([binShapeProperties, [xpos, ypos]])}
  return jsWorld_to_churchWorld([ground].concat(pegs, walls, bins));
}

physics = {}

physics.run = function(steps, initialWorld) {
  clearWorld();
  applyWorld(initialWorld);
  for (var s=0; s<steps; s++) {
    world.Step(
         1 / fps   //frame-rate
      ,  10       //velocity iterations
      ,  10       //position iterations
    );
  }
  return churchWorld_from_bodyList(world.GetBodyList());
}


physics.animate = function(steps, initialWorld) {
  function simulate(canvas, steps, initializeStep) {
    clearWorld();
    applyWorld(initialWorld);
    //setup debug draw
    var debugDraw = new b2DebugDraw();
    debugDraw.SetSprite(canvas[0].getContext("2d"));
    debugDraw.SetDrawScale(SCALE);
    debugDraw.SetFillAlpha(0.3);
    debugDraw.SetLineThickness(1.0);
    debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
    world.SetDebugDraw(debugDraw);

    function update(stepsSoFar) {
      stepsSoFar++;
      var currTime = new Date().getTime();
      requestId = requestAnimationFrame(function(time) {
        update(stepsSoFar);}
      );

      if (stepsSoFar < steps) {
        world.Step(
             1 / fps   //frame-rate
          ,  10       //velocity iterations
          ,  10       //position iterations
        );
      }

      world.DrawDebugData();
      world.ClearForces();
    };

    requestId = requestAnimationFrame(function() {update(0);});
  }

  var container = wpEditor.makeResultContainer();


  stopAnim(); //stop previous update thread..
  setTimeout(stopAnim, mspf); //make absolutely sure previous update thread is stopped
  var $physicsDiv = $("<div>").appendTo($(container));


  var $canvas = $("<canvas/>").appendTo($physicsDiv);
  $canvas.attr("width", worldWidth)
    .attr("style", "background-color:#333333;")
    .attr("height", worldHeight);

  $physicsDiv.append("<br/>");
  //var initializeStep = true;
  //simulate($canvas, 0, initializeStep);
  simulate($canvas, 0);
  //initializeStep = false;
  var $button = $("<button>Simulate</button>").appendTo($physicsDiv);
  $button.click(function() {
    //simulate($canvas, steps, initializeStep);

    stopAnim(); //stop previous update thread..
    simulate($canvas, steps);
    //initializeStep = true;
  });
  var $clearButton = $("<button>Delete Animation Window</button>")
  $clearButton.appendTo($physicsDiv);
  $clearButton.click(function() {
    var count = world.GetBodyCount();
    for (var i=0; i<count; i++) {
      var body = world.GetBodyList();
      world.DestroyBody(body);
    }
    $physicsDiv.remove();
  });
}
