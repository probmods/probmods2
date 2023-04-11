---
layout: exercise
title: Dependence - exercises
---

## Exercise 1: Causal and statistical dependency.

For each of the following programs:

* Draw the dependency diagram (Bayes net). If you don't have software on your computer for doing this, Google Docs has a decent interface for creating drawings.

* Use informal evaluation order reasoning and the intervention method to determine causal dependency between A and B.

* Use conditioning to determine whether A and B are statistically dependent.

### a)

~~~~ 
var a = flip();
var b = flip();
var c = flip(a && b ? .8 : .5);
~~~~

### b)

~~~~ 
var a = flip();
var b = flip(a ? .9 : .2);
var c = flip(b ? .7 : .1);
~~~~

### c)

~~~~ 
var a = flip();
var b = flip(a ? .9 : .2);
var c = flip(a ? .7 : .1);
~~~~

### d)

~~~~ 
var a = flip(.6);
var c = flip(.1);
var z = flip() ? a : c;
var b = z ? 'foo' : 'bar';
~~~~

### e)

~~~~ 
var examFairPrior = Bernoulli({p: .8});
var doesHomeworkPrior = Bernoulli({p: .8});
var examFair = mem(function(exam) { return sample(examFairPrior) });
var doesHomework = mem(function(student) { return sample(doesHomeworkPrior) });

var pass = function(student, exam) {
  return flip(examFair(exam) ?
              (doesHomework(student) ? .9 : .5) :
              (doesHomework(student) ? .2 : .1));
}
var a = pass('alice', 'historyExam');
var b = pass('bob', 'historyExam');
~~~~

## Exercise 2: Probabilistic programs without corresponding graphical models

As the end of the chapter mentions, some probabilistic programs do not have corresponding graphical models. This includes programs with recursion. The example below is an example of a recursive probabilistic program:

~~~~
// compute the total rainfall over the course of a storm
var totalRain = function() {
  // amount of rainfall today
  var dailyRainfall = sample(Gaussian({mu: 5, sigma: 1}))
  // if it rained a lot today, the storm is likely to continue
  if (dailyRainfall > 6 && flip(0.8) || flip(0.3)) {
    return dailyRainfall + totalRain()
  } else {
    return dailyRainfall
  }
}

viz(Infer({"model": totalRain, "method": "forward"}))
~~~~

### a)

Write another recursive probabilistic program to model some real-world phenomenon below:

~~~~

~~~~
