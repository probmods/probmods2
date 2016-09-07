---
layout: chapter
title: Generative models
description: Generative models
custom_js:
- assets/js/box2d.js
- assets/js/phys.js
---

## Exercise 1

Here are three WebPPL programs:

~~~~
flip() ? flip(.7) : flip(.1)
~~~~

~~~~
flip(flip() ? .7 : .1)
~~~~

~~~~
flip(.4)
~~~~

a) Show that the marginal distribution on return values for these three programs is the same by directly computing the probability using the rules of probability (hint: write down each possible history of random choices for each program). Check your answers by sampling from the programs.

b)  Explain why these different-looking programs can give the same results.

## Exercise 2

Explain why (in terms of the evaluation process) these two programs give different answers (i.e. have different distributions on return values):

~~~~
var foo = flip();
display([foo, foo, foo]);
~~~~

~~~~
var foo = function() {return flip()};
display([foo(), foo(), foo()]);
~~~~

## Exercise 3

In the simple medical diagnosis example we imagined a generative process for the diseases and symptoms of a single patient. If we wanted to represent the diseases of many patients we might have tried to make each disease and symptom into a ''function'' from a person to whether they have that disease, like this:

~~~~
var lungCancer = function(person) {return flip(.01)};
var cold = function(person) {return flip(.2)}

var cough = function(person) {return cold(person) || lungCancer(person)}

display([cough('bob'), cough('alice')])
~~~~

Why doesn't this work correctly if we try to do the same thing for the more complex medical diagnosis example? How could we fix it?

## Exercise 4

Work through the evaluation process for the `bend` higher-order function in this example:

~~~~
var makeCoin = function(weight) {
  return function() {
    return flip(weight) ? 'h' : 't';
  }
}
var bend = function(coin) {
  return function() {
    return coin() == 'h' ? makeCoin(.7)() : makeCoin(.1)();
}

var fairCoin = makeCoin(.5)
var bentCoin = bend(fairCoin);

viz.auto(repeat(100, bentCoin))
~~~~

Directly compute the probability of the bent coin in the example. Check your answer by comparing to the histogram of many samples.

## Exercise 5

Here is a modified version of the tug of war game. Instead of drawing strength from the continuous Gaussian distribution, strength is either 5 or 10 with equal probability. Also the probability of laziness is changed from 1/4 to 1/3. Here are four expressions you could evaluate using this modified model:

~~~~ 
var strength = mem(function(person) {
  return flip() ? 5 : 10;
});

var lazy = function(person) {return flip(1/3)}
var totalPulling = function(team) {
  return sum(map(function(person) {
    return lazy(person) ? strength(person) / 2 : strength(person);
  }, team))
}

var winner = function(team1, team2) {
  return totalPulling(team1) < totalPulling(team2) : team2 : team1;
}

// expression 1
winner(['alice'], ['bob'])

// expression 2
_.isEqual(['alice'], winner(['alice'], ['bob'])) 

// expression 3
(_.isEqual(['alice'], winner(['alice'], ['bob'])) &&
 _.isEqual(['alice'], winner(['alice'], ['fred'])))

// expression 4
(_.isEqual(['alice'], winner(['alice'], ['bob'])) &&
 _.isEqual(['jane'], winner(['jane'], ['fred'])))
~~~~

a) Write down the sequence of expression evaluations and random choices that will be made in evaluating each expression.

b) Directly compute the probability for each possible return value from each expression.

c) Why are the probabilities different for the last two? Explain both in terms of the probability calculations you did and in terms of the "causal" process of evaluating and making random choices.

## Exercise 6

Use the rules of probability, described above, to compute the probability that the geometric distribution defined by the following stochastic recursion returns the number 5.

~~~~ 
var geometric = function(p) {
  return flip(p) ? 0 : 1 + geometric(p);
};
~~~~

## Exercise 7

Convert the following probability table to a compact Church program:

|A|    B|    P(A,B)|
|--- | --- | ---|
|F|      F|     0.14|
|F|      T|     0.06|
|T|      F|     0.4|
|T|      T|     0.4|

<!--
<table>
  <tr>
    <th>A</th> <th>B</th> <th>P(A,B)</th>
  </tr>
  <tr>
    <td>F</td> <td>F</td> <td>0.14</td>
  </tr>
  <tr>
    <td>F</td> <td>T</td> <td>0.06</td>
  </tr>
  <tr>
    <td>T</td> <td>F</td> <td>0.4</td>
  </tr>
  <tr>
    <td>T</td> <td>T</td> <td>0.4</td>
  </tr>
</table>
-->										
Hint: fix the probability of A and then define the probability of B to *depend* on whether A is true or not. Run your WebPPL program and build a histogram to check that you get the correct distribution

~~~~ 
var a = ...;
var b = ...;
display([a, b])
~~~~

## Exercise 8

In [Example: Intuitive physics] above we modeled stability of a tower as the probability that the tower falls when perturbed, and we modeled "falling" as getting shorter. It would be reasonable to instead measure *how much shorter* the tower gets.

a) Below, modify the stability model by writing a continuous measure, `towerFallDegree`. Make sure that your continuous measure is in some way numerically comparable to the discrete measure, `doesTowerFall` (defined here as either 0 or 1). Mathematically, what is your continuous measure?

~~~~
///fold:
var listMin = function(xs) {
  if (xs.length == 1) {
    return xs[0]
  } else {
    return Math.min(xs[0], listMin(rest(xs)))
  }
}

var highestY = function (w) { listMin(map(function(obj) { return obj.y }, w)) }
var ground = {shape: 'rect', static: true, dims: [worldWidth, 10],
              x: worldWidth/2, y: worldHeight+6};
	      
var almostUnstableWorld = [
  ground,
  {shape: 'rect', static: false, dims: [24, 22], x: 175, y: 473},
  {shape: 'rect', static: false, dims: [15, 38], x: 159.97995044874122, y: 413},
  {shape: 'rect', static: false, dims: [11, 35], x: 166.91912737427202, y: 340},
  {shape: 'rect', static: false, dims: [11, 29], x: 177.26195677111082, y: 276},
  {shape: 'rect', static: false, dims: [11, 17], x: 168.51354470809122, y: 230}
]

var noisify = function (world) {
  var perturbX = function (obj) {
    var noiseWidth = 10
    return obj.static ? obj : _.extend({}, obj, {x: uniform(obj.x - noiseWidth, obj.x + noiseWidth) })
  }
  map(perturbX, world)
}

///

// Returns height of tower
var getTowerHeight = function(world) {
  return worldHeight - highestY(world);
}; 

var doesTowerFall = function (initialW, finalW) {
  var approxEqual = function (a, b) { Math.abs(a - b) < 1.0 }
  return !approxEqual(highestY(initialW), highestY(finalW))
}

var towerFallDegree = function(initialW, finalW) {
  // FILL THIS PART IN
  return -999;
};

var visualizeStabilityMeasure = function(measureFunction) {
  var initialWorld = noisify(almostUnstableWorld)
  var finalWorld = physics.run(1000, initialWorld)
  var measureValue = measureFunction(initialWorld, finalWorld);
  display("Stability measure: " + measureValue + "//" +
          "Initial height: " + getTowerHeight(initialWorld) + "//" +
	  "Final height: " + getTowerHeight(finalWorld));
  physics.animate(1000, initialWorld)
};

// Test binary doesTowerFall measure
// visualizeStabilityMeasure(doesTowerFall);

// Test custom towerFallDegree measure
visualizeStabilityMeasure(towerFallDegree);
~~~~

b) Are there worlds where your new model makes very different predictions about stability from the original model? Which best captures the meaning of "stable"? (it might be useful to actually code up your worlds and test them).


