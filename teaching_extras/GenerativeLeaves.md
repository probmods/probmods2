---
layout: exercise
title: Falling leaves
---

You want to understand where leaves fall under a tree in your yard. 

You imagine a single leaf falling and decide to treat time as discrete steps, and position as a single real number. At each step the current position changes to a new position. Write a simple version of this `step` function:

~~~~
var step = function(x) {
  ...
}
~~~~

Now you want to use this update function `T` times to simulate a leaf falling from `x=0` to it's final location on the ground. WebPPL is purely functional. That means you can't use a loop, eg 'for', and instead you'll want to write a *recursive* function, `doT`:

~~~~
var doT = function(t,x) {
  ...
}

doT(100,0) //simulate 100 time steps, starting at x=0
~~~~

That was one leaf, now to see the pattern we want to do this many times! Use `repeat` and `viz` to make a histogram of where your leaves end up:

~~~~

~~~~

Now, what happens when you change your `step` function? The dynamics of an actual leaf in a slice of time are very complex! The shape of the leaf, the wind, the air flow... there are many details that you could add. Try a few -- do they change the shape of the final distribution?

~~~~

~~~~

You should be noticing that the details of `step` don't matter much to the overall shape of the outcome distribution. This is an example of the *central limit theorem*. 

**Discuss**: When we build a simulation model of some aspect of the world, there are always more details that could be included. How much detail does a model need to be useful? Are there ever details which not only practically irrelevant, but in principle irrelevant?

The leaves in my yard are, however, not nicely distributed... they form drifts next to the curb (etc). How would we change the above simulation to reflect this? 

~~~~

~~~~