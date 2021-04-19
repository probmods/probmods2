---
layout: chapter
title: Rational process models
description: The psychological reality of inference algorithms.
chapter_num: 8
custom_js:
- assets/js/box2d.js
- assets/js/physics.js
- assets/js/draw.js
- assets/js/custom.js
- assets/js/paper-full.js
custom_css:
- /assets/css/draw.css
---

As we noted in an earlier chapter, there is an interesting parallel between the `Infer` abstraction, which separates model specification from inference method, and the idea of levels of analysis in cognitive science @Marr1982.
For most of this book we are interested in the *computational* level of describing what people know about the world and what inferences that knowledge licenses.
That is, we treat the model argument to `infer` as the scientific hypothesis, and the options (including 'method') argument as a engineering detail needed to derive predictions.
We can make a great deal of progress with this level of abstraction.

The *algorithmic* level goes further, attempting to describe the process by which people draw these inferences, and taking the options to `Infer` as part of the hypotheses.
While `Infer` specifies an ideal, different methods for inference will approximate this ideal better or worse in different cases; they will also do so with different time and space trade-offs.
Is it reasonable to interpret the inference algorithms that we borrow from statistics as psychological hypotheses at the algorithmic level? *Which algorithm* does the brain use for inference? Could it be MCMC? Enumeration?

If we take the algorithms for inference as psychological hypotheses, then the approximation and resource-usage characteristics of the algorithms will be the signature phenomena of interest.

<!--TODO: describe some of the research in this direction.

 - one and done.
 - drift diffusion?
 - mcmc / anchoring.
 - amortized inference.
 - neural implementation.



# How is uncertainty represented?

## Explicit representations

Population codes ad such. Difficulty of computation, scaling.

## Approximate distribution representations

The variational hypothesis

Free energy?

## The sampling hypothesis

Note that this implies that there is no explicit representation of uncertainty. Instead it will be represented implicitly in the dynamics of the system.

Gibbs sampling and jay's recurrent networks.

one and done.

### Approximate samples



# Tools for connecting levels

## Resource-rational analysis

## Causal abstraction



  -->


Test your knowledge: [Exercises]({{site.baseurl}}/exercises/process-models.html)

Reading & Discussion: [Readings]({{site.baseurl}}/readings/process-models.html)
