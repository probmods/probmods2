---
layout: exercise
title: Algorithms for Inference - exercises
description: MCMC, etc.
---

# Exercises

TODO

### 1. Robot Localization

Suppose we have a mobile robot moving around a 2D environment enclosed by a collection of walls:

~~~~
///fold:
// Environment is a collection of walls, where walls are just horizontal or
//    vertical line segments

var WallType = { Vertical: 0, Horizontal: 1 };

var makeVerticalWall = function(start, end) {
  return {
    start: start,
    end: end,
    type: WallType.Vertical,
    x: start[0],
    ylo: Math.min(start[1], end[1]),
    yhi: Math.max(start[1], end[1])
  }
};

var makeHorizontalWall = function(start, end) {
  return {
    start: start,
    end: end,
    type: WallType.Horizontal,
    y: start[1],
    xlo: Math.min(start[0], end[0]),
    xhi: Math.max(start[0], end[0])
  };
}; 

var makeWall = function(start, end) {
  if (start[0] === end[0]) {
    return makeVerticalWall(start, end);
  } else if (start[1] === end[1]) {
    return makeHorizontalWall(start, end)
  } else {
    console.error('Wall provided was not horizontal or vertical!');
    factor(NaN);
  }
};

// Connects subsequent points
var makeWalls = function(points) {
  if (points.length <= 1) return [];
  var start = points[0];
  var end = points[1];
  return [makeWall(start, end)].concat(makeWalls(points.slice(1)));
};

var drawWalls = function(canvas, walls) {
  map(function(wall) {
    canvas.line(wall.start[0], wall.start[1], wall.end[0], wall.end[1],
      4, 1, 'black');
  }, walls);
  return null;
};
///

var walls = makeWalls([
  [50, 25],
  [50, 150],
  [150, 150],
  [150, 300],
  [50, 300],
  [50, 375],
  [225, 375],
  [225, 275],
  [350, 275],
  [350, 225],
  [225, 225],
  [225, 100],
  [375, 100],
  [375, 25],
  [175, 25],
  [175, 75],
  [125, 75],
  [125, 25],
  [50, 25]
]);

var canvas = Draw(400, 400, true);
drawWalls(canvas, walls);
~~~~

As it moves, the robot records observations of its environment through an onboard sensor; this sensor records the distance to the nearest wall in several directions. The sensor isn't perfect: its measurements are noisy, and it can't sense walls beyond a certain maximum distance.

First, write a program to generate motion trajectories this robot might follow if it moved randomly. 
The code box below provides several utility functions, including the transition function the robot obeys as it moves from time step to time step.
All you need to do is fill in the `genTrajectory` function. You should use the provided `collisionWithWall` function to ensure that the generated trajectories don't involve the robot walking through walls (hint: note that the function you're filling in is called via rejection sampling).

~~~~
///fold:
// Utilities

var lerp = function(a, b, t) {
  return (1-t)*a + t*b;
};

var polar2rect = function(r, theta) {
  return [r*Math.cos(theta), r*Math.sin(theta)];
};

var range = function(n) {
  return n === 0 ? [] : range(n-1).concat([n-1]);
};

var min = function(nums) {
  return reduce(function(x, accum) {
    return Math.min(x, accum);
  }, Infinity, nums);
};

// ----------------------------------------------------------------------------

// Vector math

var vec_sub = function(v1, v0) {
  return [
    v1[0] - v0[0],
    v1[1] - v0[1]
  ];
};

// ----------------------------------------------------------------------------

// Environment is a collection of walls, where walls are just horizontal or
//    vertical line segments

var WallType = { Vertical: 0, Horizontal: 1 };

var makeVerticalWall = function(start, end) {
  return {
    start: start,
    end: end,
    type: WallType.Vertical,
    x: start[0],
    ylo: Math.min(start[1], end[1]),
    yhi: Math.max(start[1], end[1])
  }
};

var makeHorizontalWall = function(start, end) {
  return {
    start: start,
    end: end,
    type: WallType.Horizontal,
    y: start[1],
    xlo: Math.min(start[0], end[0]),
    xhi: Math.max(start[0], end[0])
  };
}; 

var makeWall = function(start, end) {
  if (start[0] === end[0]) {
    return makeVerticalWall(start, end);
  } else if (start[1] === end[1]) {
    return makeHorizontalWall(start, end)
  } else {
    console.error('Wall provided was not horizontal or vertical!');
    factor(NaN);
  }
};

// Connects subsequent points
var makeWalls = function(points) {
  if (points.length <= 1) return [];
  var start = points[0];
  var end = points[1];
  return [makeWall(start, end)].concat(makeWalls(points.slice(1)));
};

// ----------------------------------------------------------------------------

// Intersection tests

var intersectWall = function(start, dir, wall) {
  if (wall.type === WallType.Vertical) {
    var t = (wall.x - start[0]) / dir[0];
    var y = start[1] + dir[1]*t;
    return (y >= wall.ylo && y <= wall.yhi) ? t : Infinity;
  } else if (wall.type === WallType.Horizontal) {
    var t = (wall.y - start[1]) / dir[1];
    var x = start[0] + dir[0]*t;
    return (x >= wall.xlo && x <= wall.xhi) ? t : Infinity;
  }
};


var intersectWalls = function(start, dir, walls) {
  return min(filter(function(t) {
    return t >= 0;
  }, map(function(wall) {
    return intersectWall(start, dir, wall);
  }, walls)));
};

// ----------------------------------------------------------------------------

// Rendering

var drawWalls = function(canvas, walls) {
  map(function(wall) {
    canvas.line(wall.start[0], wall.start[1], wall.end[0], wall.end[1],
      4, 1, 'black');
  }, walls);
  return null;
};

var drawTrajectory = function(canvas, positions, color){
  if (positions.length <= 1) { return []; }
  var start = positions[0];
  var end = positions[1];
  canvas.line(start[0], start[1], end[0], end[1], 3, 0.5, color);
  drawTrajectory(canvas, positions.slice(1), color);
};

// ----------------------------------------------------------------------------

// Previously defined

var walls = makeWalls([
  [50, 25],
  [50, 150],
  [150, 150],
  [150, 300],
  [50, 300],
  [50, 375],
  [225, 375],
  [225, 275],
  [350, 275],
  [350, 225],
  [225, 225],
  [225, 100],
  [375, 100],
  [375, 25],
  [175, 25],
  [175, 75],
  [125, 75],
  [125, 25],
  [50, 25]
]);

///

// Robot motion prior is a semi-markov random walk
// (or just a random walk, when there's only been one prior timestep)
var transition = function(lastPos, secondLastPos){
  if (!secondLastPos) {
    return map(
      function(lastX) {
        return gaussian(lastX, 10);
      },
      lastPos
    );
  } else {
    return map2(
      function(lastX, secondLastX){
        var momentum = (lastX - secondLastX) * .9;
        return gaussian(lastX + momentum, 4);
      },
      lastPos,
      secondLastPos
    );
  }
};

// Sensor is a set of n raycasters that shoot rays outward at evenly-spaced
//    angular intervals.
// Has a maximum sensor distance (beyond which it just reports max distance)
// Also degrades (e.g. exhibits greater noise) with distance
var makeSensor = function(n, maxDist, minNoise, maxNoise) {
  return {
    rayDirs: map(function(i) {
      var ang = 2 * Math.PI * (i/n);
      return polar2rect(1, ang);
    }, range(n)),
    maxDist: maxDist,
    minNoise: minNoise,
    maxNoise: maxNoise
  };
};

// Generate a sensor observation
var sense = function(sensor, curPos, walls) {
  return map(function(dir) {
    var trueDist = intersectWalls(curPos, dir, walls);
    var cappedDist = Math.min(trueDist, sensor.maxDist);
    var t = Math.min(1, cappedDist/sensor.maxDist);
    var noise = lerp(sensor.minNoise, sensor.maxNoise, t);
    return gaussian(cappedDist, noise);
  }, sensor.rayDirs);
};

// Returns true if the robot collides with a wall by moving from secondLastPos
//    to lastPos
var collisionWithWall = function(lastPos, secondLastPos, walls) {
///fold:
  var dir = vec_sub(lastPos, secondLastPos);
  var helper = function(walls) {
    if (walls.length === 0) return false;
    var wall = walls[0];
    var t = intersectWall(secondLastPos, dir, wall);
    if (t >= 0 && t <= 1) return true;
    return helper(walls.slice(1));
  };
  return helper(walls);
///
};

var genTrajectory = function(n, initPos, sensor, walls) {
  // Fill in
};


var sensor = makeSensor(8, 40, 0.1, 3);
var initPos = [75, 50];
var trajectoryLength = 50;

var post = Infer({method: 'rejection', samples: 1}, function() {
  return genTrajectory(trajectoryLength, initPos, sensor, walls);
});
var trajectory = sample(post);

wpEditor.put('sensor', sensor);
wpEditor.put('initPos', initPos);
wpEditor.put('trajectoryLength', trajectoryLength);
wpEditor.put('trajectory', trajectory);

var canvas = Draw(400, 400, true);
drawWalls(canvas, walls);
drawTrajectory(canvas, trajectory.states, 'blue');

~~~~

<!-- ~~~~
// Solution
var init = function(initPos, sensor, walls) {
  return {
    states: [ initPos ],
    observations: [ sense(sensor, initPos, walls) ]
  };
};

var genTrajectory = function(n, initPos, sensor, walls) {
  var helper = function(n) {
        var prevData = (n == 1) ? init(initPos, sensor, walls) : helper(n-1);
    var prevStates = prevData.states;
    var prevObs = prevData.observations;
    var newState = transition(last(prevStates), secondLast(prevStates));
    var collision = collisionWithWall(newState, last(prevStates), walls);
    factor(collision ? -Infinity : 0);
    var newObs = sense(sensor, newState, walls);
    return {
      states: prevStates.concat([newState]),
      observations: prevObs.concat([newObs])
    };
  };
  return helper(n);
};
~~~~ -->

Note that this program takes quite a while to generate trajectories. Try switching from rejection sampling to SMC and play with the number of particles used. How does the behavior of SMC differ from that of rejection sampling, and why?

Now that you can generate random plausible robot motion trajectories, see if you can infer a trajectory given only the sensor observations a robot received while it was moving. The code box below sets up the scenario for you; you just need to fill in the `inferTrajectory` function.

~~~~
///fold:
// Utilities

var lerp = function(a, b, t) {
  return (1-t)*a + t*b;
};

var polar2rect = function(r, theta) {
  return [r*Math.cos(theta), r*Math.sin(theta)];
};

var range = function(n) {
  return n === 0 ? [] : range(n-1).concat([n-1]);
};

var min = function(nums) {
  return reduce(function(x, accum) {
    return Math.min(x, accum);
  }, Infinity, nums);
};

// ----------------------------------------------------------------------------

// Vector math

var vec_sub = function(v1, v0) {
  return [
    v1[0] - v0[0],
    v1[1] - v0[1]
  ];
};

// ----------------------------------------------------------------------------

// Environment is a collection of walls, where walls are just horizontal or
//    vertical line segments

var WallType = { Vertical: 0, Horizontal: 1 };

var makeVerticalWall = function(start, end) {
  return {
    start: start,
    end: end,
    type: WallType.Vertical,
    x: start[0],
    ylo: Math.min(start[1], end[1]),
    yhi: Math.max(start[1], end[1])
  }
};

var makeHorizontalWall = function(start, end) {
  return {
    start: start,
    end: end,
    type: WallType.Horizontal,
    y: start[1],
    xlo: Math.min(start[0], end[0]),
    xhi: Math.max(start[0], end[0])
  };
}; 

var makeWall = function(start, end) {
  if (start[0] === end[0]) {
    return makeVerticalWall(start, end);
  } else if (start[1] === end[1]) {
    return makeHorizontalWall(start, end)
  } else {
    console.error('Wall provided was not horizontal or vertical!');
    factor(NaN);
  }
};

// Connects subsequent points
var makeWalls = function(points) {
  if (points.length <= 1) return [];
  var start = points[0];
  var end = points[1];
  return [makeWall(start, end)].concat(makeWalls(points.slice(1)));
};

// ----------------------------------------------------------------------------

// Intersection tests

var intersectWall = function(start, dir, wall) {
  if (wall.type === WallType.Vertical) {
    var t = (wall.x - start[0]) / dir[0];
    var y = start[1] + dir[1]*t;
    return (y >= wall.ylo && y <= wall.yhi) ? t : Infinity;
  } else if (wall.type === WallType.Horizontal) {
    var t = (wall.y - start[1]) / dir[1];
    var x = start[0] + dir[0]*t;
    return (x >= wall.xlo && x <= wall.xhi) ? t : Infinity;
  }
};


var intersectWalls = function(start, dir, walls) {
  return min(filter(function(t) {
    return t >= 0;
  }, map(function(wall) {
    return intersectWall(start, dir, wall);
  }, walls)));
};

// ----------------------------------------------------------------------------

// Rendering

var drawWalls = function(canvas, walls) {
  map(function(wall) {
    canvas.line(wall.start[0], wall.start[1], wall.end[0], wall.end[1],
      4, 1, 'black');
  }, walls);
  return null;
};

var drawTrajectory = function(canvas, positions, color){
  if (positions.length <= 1) { return []; }
  var start = positions[0];
  var end = positions[1];
  canvas.line(start[0], start[1], end[0], end[1], 3, 0.5, color);
  drawTrajectory(canvas, positions.slice(1), color);
};

// ----------------------------------------------------------------------------

// Functions and values defined previously

// Returns true if the robot collides with a wall by moving from secondLastPos
//    to lastPos
var collisionWithWall = function(lastPos, secondLastPos, walls) {
  var dir = vec_sub(lastPos, secondLastPos);
  var helper = function(walls) {
    if (walls.length === 0) return false;
    var wall = walls[0];
    var t = intersectWall(secondLastPos, dir, wall);
    if (t >= 0 && t <= 1) return true;
    return helper(walls.slice(1));
  };
  return helper(walls);
};

// Robot motion prior is a semi-markov random walk
// (or just a random walk, when there's only been one prior timestep)
var transition = function(lastPos, secondLastPos){
  if (!secondLastPos) {
    return map(
      function(lastX) {
        return gaussian(lastX, 10);
      },
      lastPos
    );
  } else {
    return map2(
      function(lastX, secondLastX){
        var momentum = (lastX - secondLastX) * .9;
        return gaussian(lastX + momentum, 4);
      },
      lastPos,
      secondLastPos
    );
  }
};

// Sensor is a set of n raycasters that shoot rays outward at evenly-spaced
//    angular intervals.
// Has a maximum sensor distance (beyond which it just reports max distance)
// Also degrades (e.g. exhibits greater noise) with distance
var makeSensor = function(n, maxDist, minNoise, maxNoise) {
  return {
    rayDirs: map(function(i) {
      var ang = 2 * Math.PI * (i/n);
      return polar2rect(1, ang);
    }, range(n)),
    maxDist: maxDist,
    minNoise: minNoise,
    maxNoise: maxNoise
  };
};

var walls = makeWalls([
  [50, 25],
  [50, 150],
  [150, 150],
  [150, 300],
  [50, 300],
  [50, 375],
  [225, 375],
  [225, 275],
  [350, 275],
  [350, 225],
  [225, 225],
  [225, 100],
  [375, 100],
  [375, 25],
  [175, 25],
  [175, 75],
  [125, 75],
  [125, 25],
  [50, 25]
]);

var sensor = wpEditor.get('sensor');
var initPos = wpEditor.get('initPos');
var trajectoryLength = wpEditor.get('trajectoryLength');
///

var inferTrajectory = function(n, initPos, sensor, walls, sensorReadings) {
  // Fill in
};

var trueTrajectory = wpEditor.get('trajectory');
var sensorReadings = trueTrajectory.observations;

var post = Infer({method: 'SMC', particles: 100}, function() {
  return inferTrajectory(trajectoryLength, initPos, sensor, walls,
                         sensorReadings);
});
var inferredTrajectory = sample(post);

var canvas = Draw(400, 400, true);
drawWalls(canvas, walls);
drawTrajectory(canvas, trueTrajectory.states, 'blue');
drawTrajectory(canvas, inferredTrajectory.states, 'red');

~~~~

<!-- ~~~~
// Solution

// Observe a sensor reading
var observe = function(sensor, curPos, walls, sensorReading) {
  mapIndexed(function(i, dir) {
    var trueDist = intersectWalls(curPos, dir, walls);
    var cappedDist = Math.min(trueDist, sensor.maxDist);
    var t = Math.min(1, cappedDist/sensor.maxDist);
    var noise = lerp(sensor.minNoise, sensor.maxNoise, t);
    factor(Gaussian({mu: cappedDist, sigma: noise}).score(sensorReading[i]));
  }, sensor.rayDirs);
  return sensorReading;
};

var init = function(initPos, sensor, walls, initSensorReading) {
  return {
    states: [ initPos ],
    observations: [ observe(sensor, initPos, walls, initSensorReading) ]
  };
};

var inferTrajectory = function(n, initPos, sensor, walls, sensorReadings) {
  var helper = function(n) {
        var prevData = (n == 1) ? init(initPos, sensor, walls, sensorReadings[0]) : helper(n-1);
    var prevStates = prevData.states;
    var prevObs = prevData.observations;
    var newState = transition(last(prevStates), secondLast(prevStates));
    var collision = collisionWithWall(newState, last(prevStates), walls);
    factor(collision ? -Infinity : 0);
    var newObs = observe(sensor, newState, walls, sensorReadings[n-1]);
    return {
      states: prevStates.concat([newState]),
      observations: prevObs.concat([newObs])
    };
  };
  return helper(n);
};
~~~~ -->

Once you've gotten this to work, you might consider changing some of the parameters in this model, such as:

 - The length of the trajectory
 - The robot's initial postition
 - The nature of the sensor, such as how many directions it sees in, it's noise model, and it's maximum sensing distance.

How do different settings of these parameters affect the number of SMC particles required to infer accurate trajectories?

<!--
1) Why does the Church MH algorithm return less stable estimates when you lower the baserate for the following program?

~~~~ {data-exercise="ex1"}
(define baserate 0.1)

(define samples
  (mh-query 100 100

   (define A (if (flip baserate) 1 0))
      (define B (if (flip baserate) 1 0))
         (define C (if (flip baserate) 1 0))
	    (define D (+ A B C))

   A

   (>= D 2)))

(hist samples "Value of A, given that D is greater than or equal to 2")
~~~~
-->

<!--

# Importance sampling

Imagine we want to compute the expected value (ie. long-run average) of the composition of a thunk `p` with a rela-valued function `f`. This is:
~~~~
(define (p) ...)
(define (f x) ...)
(mean (repeat 1000 (lambda () (f (p)))))
~~~~
Mathematically this is:
:$E_p(f) = \sum_x f(x) p(x) \simeq \frac{1}{N}\sum_{x_i}f(x)$
where $x_i$ are N samples drawn from the distribution `p`.

What if `p` is hard to sample from? E.g. what if it is a conditional:
~~~~
(define (p) (query ...))
(define (f x) ...)
(mean (repeat 1000 (lambda () (f (p)))))
~~~~
One thing we could do is to sample from the conditional (via rejection or MCMC), but this can be difficult or expensive. We can also sample from a different distribution `q` and then correct for the difference:
:$E_p(f) = \sum_x f(x) \frac{p(x)}{q(x)}q(x) \simeq \frac{1}{N} \sum_{x_i}f(x)\frac{p(x)}{q(x)} $
where $x_i$ are N samples drawn from the distribution `q`. This is called '''importance sampling'''. The factor $\frac{p(x)}{q(x)}$ is called the ''importance weight''.

If we want samples from distribution `p`, rather than an expectation, we can take N importance samples then ''resample'' N times from the discrete distribution on these samples with probabilities proportional to the importance weights. In the limit of many samples this resampling gives samples from the desired distribution. (Why?)

## Sequential Importance Resampling

-->