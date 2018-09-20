---
layout: exercise
title: Conditional dependence - exercises
---


## Exercise 1: Epidemiology

Imagine that you are an epidemiologist and you are determining people's cause of death. In this simplified world, there are two main diseases, cancer and the common cold. People rarely have cancer, $$p( \text{cancer}) = 0.00001$$, but when they do have cancer, it is often fatal, $$p( \text{death} \mid \text{cancer} ) = 0.9$$. People are much more likely to have a common cold, $$p( \text{cold} ) = 0.2$$, but it is rarely fatal, $$p( \text{death} \mid \text{cold} ) = 0.00006$$. Very rarely, people also die of other causes $$p(\text{death} \mid \text{other}) = 0.000000001$$.

Write this model in WebPPL and use `Infer` to answer these questions (Be sure to include your code in your answer):

~~~~ 
Infer({method: 'enumerate'}, function() {
  ...
});
~~~~

a) Compute $$p( \text{cancer} \mid \text{death} , \text{cold} )$$ and $$p( \text{cancer} \mid \text{death} , \text{no cold} )$$. How do these probabilities compare to $$p( \text{cancer} \mid \text{death} )$$ and $$p( \text{cancer} )$$? Using these probabilities, give an example of explaining away.

b) Compute $$p( \text{cold} \mid \text{death} , \text{cancer} )$$ and $$p( \text{cold} \mid \text{death} , \text{no cancer} )$$. How do these probabilities compare to $$p( \text{cold} \mid \text{death} )$$ and $$p( \text{cold} )$$? Using these probabilities, give an example of explaining away.
