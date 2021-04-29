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
That is, we treat the model argument to `infer` as the scientific hypothesis, and the options (including 'method') argument as an engineering detail needed to derive predictions.
We can make a great deal of progress with this abstraction.

The *algorithmic* level goes further, attempting to describe the process by which people draw these inferences -- taking the options to `Infer` as part of the hypotheses.
While `Infer` specifies an ideal, different methods for inference will approximate this ideal better or worse in different cases; they will also do so with different time, space, and energy trade-offs.
Is it reasonable to interpret the inference algorithms that we borrow from statistics as psychological hypotheses at the algorithmic level? *Which algorithm* does the brain use for inference? Could it be MCMC? Enumeration?

If we take the algorithms for inference as psychological hypotheses, then the approximation and resource-usage characteristics of the algorithms will be the signature phenomena of interest. 

<!--TODO: describe some of the research in this direction.

 - one and done.
 - drift diffusion?
 - mcmc / anchoring.
 - amortized inference.
 - neural implementation.

  -->

# How is uncertainty represented?

A signature of probabilistic ("Bayesian") cognitive models is the central role of uncertainty. Generative models, our main notion of knowledge, capture uncertain causal processes. After making observations or assumptions, Infer captures uncertain answers. At the computational level we work with this uncertainty by manipulating distribution objects, without needing to explore (much) how they are created or represented. Yet cognitively there is a key algorithmic question: how is uncertainty represented in the human mind?

We have at least three very different possible asnwers to this question:

- Explicit representation of probabilities.
- Parametric representation of distribution families.
- Sampler representations.


## Explicit representations

The most straightforward interpretation of Bayesian models at the algorithmic level is that explicit probabilities for different states are computed and represented. (This is very much like the 'enumerate' method of Infer.) Attempts have been made to model how neural systems might capture these representations, via ideas such as *probabilistic population codes*. (See [Bayesian inference with probabilistic population codes](https://www.nature.com/articles/nn1790), Ma, Beck, Latham, Pouget (2006).)

Yet it is difficult to see how these explicit representations can scale up to real-world cognition.
<!--
Population codes and such. Difficulty of computation, scaling.
-->

## Approximate distribution representations

Another possible representation of uncertainty is via the parameters of a family of distirbutions. For instance, the mean and covariance of a Gaussian is a flexible and popular (in statistics) way to approximate a complex distirbution. (Indeed, we have seen that a mean-field product of Gaussians can give quick and useful inference result from variational inference.) It is thus possible that all uncertainty is represented in the human mind as parameters of some family. A version of this idea can be seen in the *free energy* hypothesis. (See [The free-energy principle: a unified brain theory?](https://www.nature.com/articles/nrn2787), Friston (2010).)

## The sampling hypothesis

Finally, it is possible that there is *no explicit representation* of uncertainty and instead it is implicitly represented in the dynamics of a dynamical system. This is the *sampling hypothesis*: that the human mind has the ability to generate samples from conditional distributions. Thus the mind implicitly represents an entire distribution, but can only work explicitly with a few samples from it.

We have seen a number of methods for creating dynamical systems that can sample from any desired distribtuion (rejection sampling, various Markov chain Monte Carlo methods, etc). This type of representation is thus possible in principle. What behavioral or neural signatures would we expect if it were correct? And *which* of the many sampling methods might be neurally plausible?

<!--

Gibbs sampling and jay's recurrent networks.

one and done.

-->

### Approximate samples



# Tools for connecting levels

## Resource-rational analysis

## Causal abstraction






Test your knowledge: [Exercises]({{site.baseurl}}/exercises/process-models.html)

Reading & Discussion: [Readings]({{site.baseurl}}/readings/process-models.html)
