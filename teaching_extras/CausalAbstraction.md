---
layout: exercise
title: Causal abstraction
---

Causal model H is a (constructive) _causal abstraction_ of causal model L if there is a mapping between the values of sets of variables in L and the values of variables in H and a corresponding mapping from interventions on H to interventions on L, such that mapping commutes with intervening.

Here is a (somewhat) complex stochastic function from Boolean inputs `x,y,w,z` to integer output.

~~~~
var L = function(x,y,w,z){
  var a = flip(0.2)
  var b = flip(0.2)
  var c = flip(0.2)
  var d = a || x || b || c
  var e = (d ? 1 : 0) + y
  var g = e + w + z + flip()
  return g
}

viz(repeat(1000,function(){L(false, false, true, true)}))
~~~~

Challenge! Create a simpler stochastic function H and show that it is a causal abstraction of L.