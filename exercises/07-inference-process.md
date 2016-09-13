---
layout: exercise
title: Inference - exercises
description: Inference
---

# Exercises

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