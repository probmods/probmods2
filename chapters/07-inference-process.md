---
layout: chapter
title: Algorithms for inference
description: From competence to process, efficiency tradeoffs of different algorithms.
custom_js:
- assets/js/box2d.js
- assets/js/physics.js
- assets/js/draw.js
- assets/js/custom.js
custom_css:
- /assets/css/draw.css
---


# Analytic Solutions

Conceptually, the simplest way to determine the probability of some variable under Bayesian inference is simply to apply Bayes' Rule and then carry out all the necessary multiplication, etc. However, this is not always possible. 

For instance, suppose your model involves a continuous function such as a `gaussian` and `gamma`. Such choices can take on an infinite number of possible values, so it is not possible to consider every one of them. In WebPPL, if we use `method: 'enumerate'` to try to calculate the analytic solution for such a model using, we get a runtime error: 

~~~~
var gaussianModel = function() {
	return gaussian(0, 1)
};
Infer({method: 'enumerate'}, gaussianModel);
~~~~

Even when all the variables are categorical, problems arise quickly. As a program makes more random choices, and as these choices gain more possible values, the number of possible execution paths through the program grows exponentially. Explicitly enumerating all of these paths can be prohibitively expensive. For instance, consider this program which computes the posterior distribution on rendered 2D lines, conditioned on those lines approximately matching this target image:

<img src="../assets/img/box.png" alt="diagram" style="width: 400px;"/>

~~~~
///fold:
var targetImage = Draw(50, 50, false);
loadImage(targetImage, "../assets/img/box.png");

var drawLines = function(drawObj, lines){
  var line = lines[0];
  drawObj.line(line[0], line[1], line[2], line[3]);
  if (lines.length > 1) {
    drawLines(drawObj, lines.slice(1));
  }
};
///

var makeLines = function(n, lines, prevScore){
  // Add a random line to the set of lines
  var x1 = randomInteger(50);
  var y1 = randomInteger(50);
  var x2 = randomInteger(50);
  var y2 = randomInteger(50);
  var newLines = lines.concat([[x1, y1, x2, y2]]);
  // Compute image from set of lines
  var generatedImage = Draw(50, 50, false);
  drawLines(generatedImage, newLines);
  // Factor prefers images that are close to target image
  var newScore = -targetImage.distance(generatedImage)/1000;
  factor(newScore - prevScore);
  generatedImage.destroy();
  // Generate remaining lines (unless done)
  return (n==1) ? newLines : makeLines(n-1, newLines, newScore);
};

var lineDist = Infer(
  { method: 'enumerate', strategy: 'depthFirst', maxExecutions: 10 },
  function(){
    var lines = makeLines(4, [], 0);
    var finalGeneratedImage = Draw(50, 50, true);
    drawLines(finalGeneratedImage, lines);
    return lines;
  });

viz.table(lineDist);
~~~~

Running this program, we can see that enumeration starts by growing a line from the bottom-right corner of the image, and then proceeds to methodically plot out every possible line length that could be generated. These are all fairly terrible at matching the target image, and there are billions more states like them that enumeration would have to wade through in order to find those few that have high probability.

# Approximate Inference

Luckily, it is often possible to estimate the posterior probability fairly accurately, even though we cannot calculate it exactly. There are a number of different algorithms, each of which has different properties.

## Rejection Sampling

Rejection sampling (implemented in `method:"rejection"`), which we introduced in [conditioning]({{site.baseurl}}/chapters/03-conditioning.html), is conceptually the simplest. However, it is not very efficient. Recall that it works by randomly sampling values for the variables and then checking to see if the condition is met, rejecting the sample if it is not. If the condition is *a priori* unlikely, the vast majority of samples will be rejected, and so it will take a very large number of samples to find computations that do so. To see this, try running the following model with progressively smaller values for `baserate`:

~~~~
var baserate = 0.1

var model = function(){
  var A = flip(baserate)
  var B = flip(baserate)
  var C = flip(baserate)
  condition(A+B+C >= 2)
  return A
}

viz(Infer({method: 'rejection', samples: 100}, model))
~~~~

Even for this simple program -- and even though we are only asking for 100 successful (non-rejected) samples -- lowering the baserate by just one order of magnitude, to $$0.01$$, slows down inference considerably. Lowering the baserate to $$0.001$$ makes inference impractical.

It can be useful to compare this directly to what happens with enumeration. Changing the baserate has no effect on runtime, but adding additional variables (var D = flip(baserate), var E = flip(baserate), etc.) can slow down inference dramatically. (Why?)

~~~~
var baserate = 0.1

var model = function(){
  var A = flip(baserate)
  var B = flip(baserate)
  var C = flip(baserate)
  condition(A+B+C >= 2)
  return A
}

viz(Infer({method: 'enumerate'}, model))
~~~~

## Markov chain Monte Carlo (MCMC)

With rejection sampling, each sample is an independent draw from the model's prior. Markov chain Monte Carlo, in contrast involves a random walk through the posterior. Each sample depends on the prior sample -- but ony the prior sample (it is a *Markov* chain). If the random walk is done correctly, the probability you sample a particular set of values for the variables in the model is proportional to the conditional probability of those values. That is, instead of sampling randomly (as in rejection sampling), we sample smartly, focusing on exactly those parts of the probability space that are high-probability. In the limit, rejection sampling and MCMC will converge, but MCMC can be much faster. 

Consider:


~~~~
var baserate = 0.1

var model = function(){
  var A = flip(baserate)
  var B = flip(baserate)
  var C = flip(baserate)
  condition(A+B+C >= 2)
  return A
}

viz(Infer({method: 'MCMC', lag: 100}, model))
~~~~

Again, see what happens in the above inference as you lower the baserate. Unlike rejection sampling, inference will not slow down appreciably, though results will become less stable. Unlike enumeration, inference should also not slow down exponentially as the size of the state space is increased.
This is an example of the kind of tradeoffs that are common between different inference algorithms.

To get a better sense of what is going on, let's return to our attempt to match the 2D image. This time, we will take 50 MCMC samples:

~~~~
///fold:
var targetImage = Draw(50, 50, false);
loadImage(targetImage, "../assets/img/box.png");

var drawLines = function(drawObj, lines){
  var line = lines[0];
  drawObj.line(line[0], line[1], line[2], line[3]);
  if (lines.length > 1) {
    drawLines(drawObj, lines.slice(1));
  }
};
///

var makeLines = function(n, lines, prevScore){
  // Add a random line to the set of lines
  var x1 = randomInteger(50);
  var y1 = randomInteger(50);
  var x2 = randomInteger(50);
  var y2 = randomInteger(50);
  var newLines = lines.concat([[x1, y1, x2, y2]]);
  // Compute image from set of lines
  var generatedImage = Draw(50, 50, false);
  drawLines(generatedImage, newLines);
  // Factor prefers images that are close to target image
  var newScore = -targetImage.distance(generatedImage)/1000;
  factor(newScore - prevScore);
  generatedImage.destroy();
  // Generate remaining lines (unless done)
  return (n==1) ? newLines : makeLines(n-1, newLines, newScore);
};

var lineDist = Infer(
  { method: 'MCMC', samples=50},
  function(){
    var lines = makeLines(4, [], 0);
    var finalGeneratedImage = Draw(50, 50, true);
    drawLines(finalGeneratedImage, lines);
    return lines;
  });

viz.table(lineDist);
~~~~

As you can see, each successive sample is highly similar to the previous one. Since the first sample is chosen randomly, the sequence you see will be very different if you re-run the model. 

There are a number of different algorithms for MCMC, each of which has different properties. By default `method:'MCMC'` yields the *Metropolis Hastings* version of MCMC).

### Hamiltonian Monte Carlo

When the input to a `factor` statement is a function of multiple variables, those variables become correlated in the posterior distribution. If the induced correlation is particularly strong, MCMC can sometimes become 'stuck.' In controling the random walk, Metropolis-Hastings choses a new point in probability space to go to and then decides whether or not to go based on the probability of the new point. If it has difficulty finding new points with reasonable probability, it will get stuck and simplly stay where it is. Given an infinite amount of time, Metropolis-Hastings will recover. However, the first N samples will be heavily dependent on where the chain started (the first sample) and will be a poor approximation of the true posterior. 

Take this example below, where we use a Gaussian likelihood factor to encourage ten uniform random numbers to sum to the value 5:

~~~~
var bin = function(x) {
  return Math.floor(x * 1000) / 1000;
};

var constrainedSumModel = function() {
  var xs = repeat(10, function() {
    return uniform(0, 1);
  });
  var targetSum = xs.length / 2;
  factor(Gaussian({mu: targetSum, sigma: 0.005}).score(sum(xs)));
  return map(bin, xs);
};

var post = Infer({
	method: 'MCMC',
	samples: 5000,
	callbacks: [MCMC_Callbacks.finalAccept]
}, constrainedSumModel);
var samps = repeat(10, function() { return sample(post); });
reduce(function(x, acc) {
	return acc + 'sum: ' + sum(x).toFixed(3) + ' | nums: ' + x.toString() + '\n';
}, '', samps);
~~~~

The output box displays 10 random samples from the posterior. You'll notice that they are all very similiar, despite there being many distinct ways for ten real numbers to sum to 5. The reason is technical but straight-forward.  The program above uses the `callbacks` option to `MCMC` to display the final acceptance ratio (i.e. the percentage of proposed samples that were accepted)--it should be around 1-2%, which is very inefficient.

To deal with situations like this one, WebPPL provides an implementation of [Hamiltonian Monte Carlo](http://docs.webppl.org/en/master/inference.html#kernels), or HMC. HMC automatically computes the gradient of the posterior with respect to the random choices made by the program. It can then use the gradient information to make coordinated proposals to all the random choices, maintaining posterior correlations. Below, we apply HMC to `constrainedSumModel`:

~~~~
///fold:
var bin = function(x) {
  return Math.floor(x * 1000) / 1000;
};

var constrainedSumModel = function() {
  var xs = repeat(10, function() {
    return uniform(0, 1);
  });
  var targetSum = xs.length / 2;
  factor(Gaussian({mu: targetSum, sigma: 0.005}).score(sum(xs)));
  return map(bin, xs);
};
///

var post = Infer({
	method: 'MCMC',
	samples: 100,
	callbacks: [MCMC_Callbacks.finalAccept],
	kernel: {
		HMC : { steps: 50, stepSize: 0.0025 }
	}
}, constrainedSumModel);
var samps = repeat(10, function() { return sample(post); });
reduce(function(x, acc) {
	return acc + 'sum: ' + sum(x).toFixed(3) + ' | nums: ' + x.toString() + '\n';
}, '', samps);
~~~~

The approximate posterior samples produced by this program are more varied, and the final acceptance rate is much higher.

There are a couple of caveats to keep in mind when using HMC:

 - Its parameters can be extremely sensitive. Try increasing the `stepSize` option to `0.004` and seeing how the output samples degenerate. 
 - It is only applicable to continuous random choices, due to its gradient-based nature. You can still use HMC with models that include discrete choices, though: under the hood, this will alternate between HMC for the continuous choices and MH for the discrete choices.

## Particle Filters

TODO

## Variational Inference

TODO

# Process-level cognitive modeling

As we noted in an earlier chapter, there is an interesting parallel between the `Infer` abstraction, which separates model specification from inference method, and the idea of levels of analysis in cognitive science @Marr1982.
For most of this book we are interested in the *computational* level of describing what people know about the world and what inferences that knowledge licenses.
That is, we treat the model argument to `infer` as the scientific hypothesis, and the options (including 'method') argument as a engineering detail needed to derive predictions.
We can make a great deal of progress with this level of abstraction.

The *algorithmic* level goes further, attempting to describe the process by which people draw these inferences, and taking the options to `Infer` as part of the hypotheses.
While `Infer` specifies an ideal, different methods for inference will approximate this ideal better or worse in different cases; they will also do so with different time and space tradeoffs.
Is it reasonable to interpret the inference algorithms that we borrow from statistics as psychological hypotheses at the algorithmic level? *Which algorithm* does the brain use for inference? Could it be MCMC? Enumeration?

If we take the algorithms for inference as psychological hypotheses, then the approximation and resource-usage characteristics of the algorithms will be the signature phenomena of interest.
<!--TODO: describe some of the research in this direction.-->

<!-- TODO: Something on resource-rational process models? -->


<!--

# Markov chains as samplers

We have already seen [Markov models](observing-sequences.html#markov-models) used to describe sequences of observations.
A Markov model (or Markov *chain*, as it is often called in the context of inference algorithms) is a discrete dynamical system that unfolds over iterations of the `transition` function.
Here is a Markov chain:

~~~~
(define (transition state)
  (case state
    (('a) (multinomial '(a b c d) '(0.48 0.48 0.02 0.02)))
    (('b) (multinomial '(a b c d) '(0.48 0.48 0.02 0.02)))
    (('c) (multinomial '(a b c d) '(0.02 0.02 0.48 0.48)))
    (('d) (multinomial '(a b c d) '(0.02 0.02 0.48 0.48)))))


(define (chain state n)
  (if (= n 0)
      state
      (chain (transition state) (- n 1))))

(hist (repeat 2000 (lambda () (chain 'a 10))) "10 steps, starting at a.")
(hist (repeat 2000 (lambda () (chain 'c 10))) "10 steps, starting at c.")
(hist (repeat 2000 (lambda () (chain 'a 30))) "30 steps, starting at a.")
(hist (repeat 2000 (lambda () (chain 'c 30))) "30 steps, starting at c.")
~~~~

Notice that the distribution of states after only a few steps is highly influenced by the starting state. In the long run the distribution looks the same from any starting state: this long-run distribution is the called the *stable distribution* (also known as *stationary distribution*). For the chain above, the stable distribution is uniform---we have another (fairly baroque!) way to sample from the uniform distribution on `'(a b c d)`!

Of course we could have sampled from the uniform distribution using other Markov chains. For instance the following chain is more natural, since it transitions uniformly:

~~~~
(define (transition state)
  (uniform-draw '(a b c d)))

(define (chain state n)
  (if (= n 0)
      state
      (chain (transition state) (- n 1))))

(hist (repeat 2000 (lambda () (chain 'a 2))) "a 2")
(hist (repeat 2000 (lambda () (chain 'c 2))) "c 2")
(hist (repeat 2000 (lambda () (chain 'a 10))) "a 10")
(hist (repeat 2000 (lambda () (chain 'c 10))) "c 10")
~~~~

Notice that this chain converges much more quickly to the uniform distribution---after only one step.
The number of steps it takes for the distribution on states to reach the stable distribution (and hence lose traces of the starting state) is called the *burn-in time*.
We can use a Markov chain as a way to (approximately) sample from its stable distribution, but the efficiency depends on burn-in time.
While many Markov chains have the same stable distribution they can have very different burn-in times, and hence different efficiency.
-->

<!--
## Markov chains with lag

We get the same distribution from samples from a single run, if we wait long enough between samples:

~~~~
(define (transition state)
  (case state
    (('a) (multinomial '(a b c d) '(0.48 0.48 0.02 0.02)))
    (('b) (multinomial '(a b c d) '(0.48 0.48 0.02 0.02)))
    (('c) (multinomial '(a b c d) '(0.02 0.02 0.48 0.48)))
    (('d) (multinomial '(a b c d) '(0.02 0.02 0.48 0.48)))))


(define (chain state n)
  (if (= n 0)
      (list state)
      (pair state (chain (transition state) (- n 1)))))

(define (take-every lst n)
  (if (< (length lst) n)
      '()
      (pair (first lst) (take-every (drop lst n) n))))

(hist (drop (chain 'a 100) 30) "burn-in 30, lag 0")
(hist (take-every (drop (chain 'a 2000) 30) 20) "burn-in 30, lag 10")
'done
~~~~

-->

<!--
# Markov chains with infinite state space

Markov chains can also be constructed over infinite state spaces. Here's a chain over the integers:

~~~~
(define theta 0.7)

(define (transition state)
  (if (= state 3)
      (multinomial (list 3 4)
                   (list (- 1 (* 0.5 theta)) (* 0.5 theta)))
      (multinomial (list (- state 1) state (+ state 1))
                   (list 0.5 (- 0.5 (* 0.5 theta)) (* 0.5 theta)))))

(define (chain state n)
  (if (= n 0)
      state
      (chain (transition state) (- n 1))))

(hist (repeat 2000 (lambda () (chain 3 20))) "markov chain")
~~~~

As we can see, this Markov chain has as its stationary distribution a geometric distribution conditioned to be greater than 2. We can also write it using `query` syntax:

~~~~
(define (geometric theta) (if (not (flip theta)) ;; assume theta is prob(success)
                              (+ 1 (geometric theta))
                              1))

(define samples
  (mh-query 2000 20
   (define x (geometric 0.3))
   x
   (> x 2)))

(hist samples "geometric > 2.")
~~~~

The Markov chain above *implements* the query below, in the sense that it specifies a way to sample from the required conditional distribution.



# Getting the right chain: MCMC

It turns out that for any (conditional) distribution there is a Markov chain with that stationary distribution. How can we find one when we need it? There are several methods for constructing them---they go by the name "Markov chain Monte Carlo".

First, if we have a target distribution, how can we tell if a Markov chain has this target distribution as its stationary distribution? Let $p(x)$ be the target distribution, and let $\pi(x \rightarrow x')$ be the transition distribution (i.e. the `transition` function in the above programs). Since the stationary distribution is characterized by not changing when the transition is applied we have a *balance condition*:
$p(x') = \sum_x p(x)\pi(x \rightarrow x')$.
Note that the balance condition holds for the distribution as a whole---a single state can of course be moved by the transition.

There is another condition, called *detailed balance*, that is sufficient (but not necessary) to give the balance condition, and is often easier to work with: $p(x)\pi(x \rightarrow x') = p(x')\pi(x' \rightarrow x)$.
To show that detailed balance implies balance, substitute the right-hand side of the detailed balance equation into the balance equation (replacing the summand), then simplify.

To construct a Markov chain that converges to a stationary distribution of interest, we also need to ensure that any state can be reached from any other state in a finite number of steps. This requirement is called *ergodicity*. If a chain is not ergodic, it may still leave the stationary distribution unchanged when the transition operator is applied, but the chain will not reliably converge to the stationary distribution when initialized with a state sampled from an arbitrary distribution.



## Satisfying detailed balance: MH

How can we come up with a `transition` function, $\pi$, that satisfies detailed balance? One way is the *Metropolis-Hastings* recipe.

We start with a *proposal distribution*, $q(x\rightarrow x')$, which does not need to have the target distribution as its stationary distribution, but should be easy to sample from. We correct this into a transition function with the right stationary distribution by either accepting or rejecting each proposed transition. We accept with probability: $\min\left(1, \frac{p(x')q(x'\rightarrow x)}{p(x)q(x\rightarrow x')}\right).$
That is, we flip a coin with that probability: if it comes up heads our next state is $x'$, otherwise our next state is still $x$.

As an exercise, try to show that this rule gives an actual transition probability (i.e. $\pi(x\rightarrow x')$) that satisfies detailed balance. (Hint: the probability of transitioning depends on first proposing a given new state, then accepting it; if you don't accept the proposal you "transition" to the original state.)

In Church the MH recipe looks like:

~~~~{.norun}
(define (target-distr x) ...)
(define (proposal-fn x) ...)
(define (proposal-distr x1 x2) ...)

(define (accept? x1 x2)
  (flip (min 1 (/ (* (target-distr x2) (proposal-distr x2 x1))
                  (* (target-distr x1) (proposal-distr x1 x2))))))

(define (transition x)
  (let ((proposed-x (proposal-fn x)))
    (if (accept? x proposed-x) proposed-x x)))

(define (mcmc state iterations)
  (if (= iterations 0)
      '()
      (pair state (mcmc (transition state) (- iterations 1)))))
~~~~

Note that in order to use this recipe we need to have a function that computes the target probability (not just one that samples from it) and the transition probability, but they need not be normalized (since the normalization terms will cancel).

We can use this recipe to construct a Markov chain for the conditioned geometric distribution, as above, by using a proposal distribution that is equally likely to propose one number higher or lower:

~~~~
(define theta 0.7)

;;the target distribution (not normalized):
(define (target-distr x)
  (if (< x 3) ;;the condition
      0.0     ;;prob is 0 if condition is violated
      (* (expt (- 1 theta) (- x 1)) theta))) ;;otherwise prob is (proportional to) geometric distrib.

;;the proposal function and distribution,
;;here we're equally likely to propose x+1 or x-1.
(define (proposal-fn x) (if (flip) (- x 1) (+ x 1)))
(define (proposal-distr x1 x2) 0.5)

;;the MH recipe:
(define (accept? x1 x2)
  (flip (min 1.0 (/ (* (target-distr x2) (proposal-distr x2 x1))
                    (* (target-distr x1) (proposal-distr x1 x2))))))

(define (transition x)
  (let ((proposed-x (proposal-fn x)))
    (if (accept? x proposed-x) proposed-x x)))

;;the MCMC loop:
(define (mcmc state iterations)
  (if (= iterations 0)
      '()
      (pair state (mcmc (transition state) (- iterations 1)))))


(hist (mcmc 3 1000) "mcmc for conditioned geometric")
~~~~

The transition function that is automatically derived using the MH recipe is equivalent to the one we wrote by hand above.
-->

<!--
For background on MH and MCMC, see the excellent introductions by David MacKay ([Chapter 29](http://www.inference.phy.cam.ac.uk/mackay/itprnn/ps/356.384.pdf) and [30](http://www.inference.phy.cam.ac.uk/mackay/itprnn/ps/387.412.pdf) of Information Theory, Inference, and Learning Algorithms) or [Radford Neal](http://www.cs.utoronto.ca/~radford/review.abstract.html).
-->

<!--

## States with structure

Above the states were single entities (letters or numbers), but of course we may have probabilistic models where the state is more complex. In this case, element-wise proposals (that change a single part of the state at a time) can be very convenient.

For instance, consider the one-dimensional Ising model:

~~~~
(define (all-but-last xs)
  (cond ((null? xs) (error "all-but-last got empty list!"))
        ((null? (rest xs)) '())
        (else (pair (first xs) (all-but-last (rest xs))))))

(define (all xs)
  (if (null? xs)
      #t
      (and (first xs)
           (all (rest xs)))))

(define (noisy-equal? a b)
  (flip (if (equal? a b) 1.0 0.2)))

(define samples
  (mh-query 30 1
            (define bits (repeat 10 (lambda () (if (flip) 1 0))))
            bits
            (all (map noisy-equal? (rest bits) (all-but-last bits)))))

(apply display samples)
~~~~

Here the state is a list of Boolean values (shown as 0/1 for readability). We can use an MH recipe with proposals that change a single element of this list at a time--indeed, if you look at the list of samples returned, you will notice that this is what the Church MH algorithm does.


## MH on program executions

How could we use the MH recipe for arbitrary Church programs? What's the state space? What are the proposals?

Church MH takes as the state space the space of all executions of the code inside a query. Equivalently this is the space of all random choices that may be used in the process of executing this code (unused choices can be ignored without loss of generality by marginalizing). The un-normalized score is just the product of the probabilities of all the random choices, or zero if the conditioner doesn't evaluate to true.

Proposals are made by changing a single random choice, then updating the execution (which may result in choices being created or deleted).

To get this all to work we need a way to identify random choices across different executions of the program. We can do this by augmenting the program with "call names".


## Biases of MCMC

An MCMC sampler is guaranteed to take unbiased samples from its stationary distribution "in the limit" of arbitrary time between samples. In practice MCMC will have characteristic biases in the form of long burn-in and slow mixing.

We already saw an example of slow mixing above: the first Markov chain we used to sample from the uniform distribution would take (on average) several iterations to switch from `a` or `b` to `c` or `d`. In order to get approximately independent samples, we needed to wait longer than this time between taking iterations. In contrast, the more efficient Markov chain (with uniform transition function) let us take sample with little lag. In this case poor mixing was the result of a poorly chosen transition function. Poor mixing is often associated with multimodal distributions.



# Inference for nested queries

In the [previous chapter](inference-about-inference.html) we saw how inference about inference could be modeled by using nested-queries. For the examples in that chapter we used rejection sampling, because it is straightforward and well-behaved. Of course, rejection sampling will become unacceptably slow if the probability of the condition in any level of query becomes small---this happens very quickly for nested-query models when the state space grows. Each of the other types of query can, in principle, also be nested, but some special care is needed to get good performance.

To explore alternative algorithms for nested-query, let's start with a simple example:

~~~~
(define (inner x)
  (rejection-query
    (define y (flip))
    y
    (flip (if x 1.0 (if y 0.9 0.1)))))

(define (outer)
  (rejection-query
    (define x (flip))
    x
    (not (inner x))))

(hist (repeat 10000 outer))
~~~~

We could compute the same answer using enumeration, recall that enumeration returns the explicit marginal distribution, so we have to sample from it using `multinomial`:

~~~~
(define (inner x)
  (enumeration-query
   (define y (flip))
   y
   (flip (if x 1.0 (if y 0.9 0.1)))))

(define (outer)
  (enumeration-query
   (define x (flip))
   x
   (not (apply multinomial (inner x)))))

(barplot (outer))
~~~~

However, notice that this combination will recompute the inner and outer distributions every time they are encountered. Because these distributions are deterministically fixed (since they are the explicit marginal distributions, not samples), we could *cache* their values using `mem`. This technique, an example of *dynamic programming*, avoids work and so speeds up the computation:

~~~~
(define inner
  (mem (lambda (x)
         (enumeration-query
          (define y (flip))
          y
          (flip (if x 1.0 (if y 0.9 0.1)))))))

(define outer
  (mem (lambda ()
         (enumeration-query
          (define x (flip))
          x
          (not (apply multinomial (inner x)))))))

(barplot (outer))
~~~~

This enumeration-with-caching technique is extremely useful for exploring small nested-query models, but it becomes impractical when the state space of any one of the queries grows too large. As before, an alternative is MCMC.

~~~~
(define inner
  (mem (lambda (x)
         (mh-query 1000 1
          (define y (flip))
          y
          (flip (if x 1.0 (if y 0.9 0.1)))))))

(define outer
  (mem (lambda ()
         (mh-query 1000 1
          (define x (flip))
          x
          (not (uniform-draw (inner x)))))))

(hist (repeat 10000 (lambda () (uniform-draw (outer)))))
~~~~

Here we are caching a set of samples from each query, and drawing one at random when we need a sample from that distribution. Because we re-use the same set of samples many times, this can potentially introduce bias into our results; if the number of samples is large enough, though, this bias will be very small.

We can also mix these methods---using enumeration for levels of query with few states, rejection for queries with likely conditions, and MCMC for queries where these methods take too long.

Test your knowledge: [Exercises]({{site.baseurl}}/exercises/07-inference-process.html)
-->

Test your knowledge: [Exercises]({{site.baseurl}}/exercises/07-inference-process.html)

Reading & Discussion: [Readings]({{site.baseurl}}/readings/07-inference-process.html)

Next chapter: [Learning as conditional inference]({{site.baseurl}}/chapters/08-learning-as-conditional-inference.html)
