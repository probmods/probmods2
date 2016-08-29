% Algorithms for inference


# The performance characteristics of different algorithms

When we introduced [conditioning](conditioning.html#hypothetical-reasoning-with-query) we pointed out that the rejection sampling and mathematical definitions are equivalent---we could take either one as the definition of `query`, showing that the other specifies the same distribution. There are many different ways to compute the same distribution, it is thus useful to separately think about the distributions we are building (including conditional distributions) and how we will compute them. Indeed, in the last few chapters we have explored the dynamics of inference without worrying about the details of inference algorithms. The efficiency characteristics of different implementations of `query` can be very different, however, and this is important both practically and for motivating cognitive hypotheses at the level of algorithms (or psychological processes).

The "guess and check" method of rejection sampling, implemented in `rejection-query`, is conceptually useful but is often not efficient: even if we are sure that our model can satisfy the condition, it will often take a very large number of samples to find computations that do so. To see this, try making the `baserate` probability of `A`, `B`, and `C` lower in this example:

~~~~
(define baserate 0.1)

(define (take-sample)
  (rejection-query

   (define A (if (flip baserate) 1 0))
   (define B (if (flip baserate) 1 0))
   (define C (if (flip baserate) 1 0))
   (define D (+ A B C))

   A

   (>= D 2)))
   
(hist (repeat 100 take-sample) "Value of A, given D >= 2, using rejection")
~~~~

Even for this simple program, lowering the baserate by just one order of magnitude, to 0.01, will make `rejection-query` impractical.

Another option is to use the mathematical definition of conditional probability directly: to *enumerate* all of the execution histories for the query, and then to use the rules of probability to compute the conditional probability (which we can then use to sample if we wish):
(NOTE: The `enumeration-query` implementation returns the exact distribution as a list of values and a list of probabilities, rather than a sample.)

~~~~
(define baserate 0.1)

(enumeration-query

 (define A (if (flip baserate) 1 0))
 (define B (if (flip baserate) 1 0))
 (define C (if (flip baserate) 1 0))
 (define D (+ A B C))

 A

 (>= D 2))
~~~~

Notice that the time it takes for this program to run doesn't depend on the baserate. Unfortunately it does depend critically on the number of random choices in an execution history: the number of possible histories that must be considered grows exponentially in the number of random choices. To see this try adding more random choices to the sum (following the pattern of `A`). The dependence on size of the execution space renders `enumeration-query` impractical for all but the simplest models.

There are many other algorithms and techniques for dealing with conditional probabilistic inference, and several of these have been adapted into Church to give implementations of `query` that may be more efficient in various cases. One implementation that we have used already is based on the *Metropolis Hastings* algorithm, a form of *Markov chain Monte Carlo* inference. 

~~~~
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

See what happens in the above query as you lower the baserate.  Inference should not slow down appreciably, but it will become less stable and less accurate.  

It becomes increasingly difficult for MH to draw independent conditional samples by taking small random steps, so for a fixed lag (100 in the code above), the 100 samples returned will tend to be less representative of the true conditional inference.  In this case, stable and accurate conditional inferences can still be achieved in reasonable time by increasing the number of samples to 500 (while holding the lag at 100).


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


<!--
For background on MH and MCMC, see the excellent introductions by David MacKay ([Chapter 29](http://www.inference.phy.cam.ac.uk/mackay/itprnn/ps/356.384.pdf) and [30](http://www.inference.phy.cam.ac.uk/mackay/itprnn/ps/387.412.pdf) of Information Theory, Inference, and Learning Algorithms) or [Radford Neal](http://www.cs.utoronto.ca/~radford/review.abstract.html).
-->


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
