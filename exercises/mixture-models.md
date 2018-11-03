---
layout: exercise
title: Occam's razor - exercises
---

## Exercise 1. Social group reasoning

Our knowledge about the social world is *structured*: we do not just know a collection of facts about particular people but believe that there are *kinds* of people with shared properties. Even infants make strong assumptions about people based on what language they speak, what foods they eat, and what actions they take (check out Katherine Kinzler's work!) How do we learn this structure at the same time as we are learning about individual people? In this exercise you will explore mixture models as a formal model of how we reason about social groups.

### a)

Imagine you go to an alien planet and see 10 aliens: you notice that every alien has an antenna shape, a spacesuit color, and a distinctive noise. Implement a simple model assuming that there are two kinds of aliens with different distributions over these properties, but you have uncertainty over what the distributions are, and whether any particular alien belongs to group A or group B.

~~~~
var data = [
  {antenna : 'stars', spacesuit: 'green', noise: 'eeeeeek'},
  {antenna : 'spheres', spacesuit: 'red', noise: 'blargh'},
  {antenna : 'spheres', spacesuit: 'green', noise: 'blargh'},
  {antenna : 'spheres', spacesuit: 'green', noise: 'blargh'},
  {antenna : 'stars', spacesuit: 'green', noise: 'eeeeeek'},
  {antenna : 'stars', spacesuit: 'red', noise: 'eeeeeek'}
]
~~~~

### b)

Now imagine you hear a noise from inside a crater but you cannot see the alien that emitted it; this is a noisy observation. How can you use the model you learned above to make an educated guess about their other features?

### c)

While these *stereotypes* may be functionally useful when thinking about easily observable physical properties of aliens, allowing us to make strong inferences about new individuals on the basis of sparse data, this assumption of structure can backfire and lead to incorrect inferences when some features are latent or harder to observe. 