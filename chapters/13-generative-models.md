---
layout: chapter
title: 'Psych 201s: Generative models and functional programming in WebPPL'
author: "mht"
description: Alternative 'generative models' chapter from BDA course
---

We will switch to using WebPPL, which is what's called a *probabilistic programming language* (PPL). PPLs are languages for doing Bayesian inference (updating beliefs with data). 

WebPPL is also a *functional* programming language, so we will go over some basic ideas of functional programming here as well. Functional programming languages are everywhere: R is a functional language, JavaScript is too.

We'll introduce WebPPL first with distributions, and then build *generative models* that formalize very general scientific hypotheses.

For reference, a full list of distributions in WebPPL can be found [here](http://webppl.readthedocs.io/en/master/distributions.html)

# Bernoulli distribution

The simplest probability distribution results from the random process of flipping a coin.
It is called a Bernoulli distribution (some people just call it a flip).

In WebPPL, you can access the Bernoulli distribution using the call `Bernoulli`

~~~~
Bernoulli({ p: 0.5 })
~~~~

The `Bernoulli` distribution takes a single parameter `p` inside of a JavaScript style object `{p: 0.5}` 
(Technical note: An object is the exactly the same idea of a dictionary from Python, or a JSON object from JavaScript; it's very similar conceptually to a dataframe in R).

What happens when we call `Bernoulli`? 
(Note: the capital letter is important).

We get out a table of probabilities. 
Each possible outcome of the random process (here, a coin flip) is an element of the **support**. 
Associated with each element of a support is the probability of that outcome. 

Let's visualize this.

~~~~
var dist = Bernoulli( { p: 0.5 } )
viz.auto(dist)
~~~~

Try changing around `p`. What happens?

Distributions in WebPPL can be sampled from, by calling `sample( ... )` on the distribution.

~~~~
sample( Bernoulli({ p: 0.5 }) )
~~~~

You might notice this call is somewhat slow.
This is a fixed-cost, however, and will be worth it once we start considering more interesting cases than just a single coin flip.

Note, unlike `Bernoulli` (which can returns the same thing each time you call it), `sample(Bernoulli(...))` is **stochastic**: It is a random sample from the Bernoulli distribution. 
For shorthand, you can sample from a distribution using the lower-case name (e.g. `bernoulli({p:0.5})`); you can even drop the parameter object and just give it the parameter value (i.e., `bernoulli(0.5)`). 
However, we will continue to use the longer `sample(Distribution ( ... ) )` notation for explicitness.

# Binomial distribution

What about if we wanted to flip the coin multiple times? (or, equivalently, what if we collected some number of participants worth of data on a 2AFC).

If we don't don't care about the order of the flips (or, the identities of our participants), then the data is distributed according to what's called the Binomial distribution.

~~~~
Binomial({n:3, p:0.5 })
~~~~

`Binomial` takes in parameters `n` and `p`, bundled together in the same object structure we saw above. `p` is the weight of the coin; same as in `bernoulli`.
`n` is the number of times you flip it (or, the number of identical coins you flip). 
Note that we know are getting out a number: it is the number of coins that came up heads (or, `TRUE`, as we saw above).

What does the distribution look like?

~~~~
Binomial( {n:3, p:0.5 } )
~~~~

Let's visualize this.

~~~~
webppl("Binomial( {n:3, p:0.5 } )") %>%
  ggplot(., aes( x = support, y = prob ))+
  geom_bar( stat = 'identity', position = position_dodge() )
~~~~

Interesting. So 1 and 2 heads are more probable than 0 or 3. Do you understand why?

Try changing `n`. What happens? Why?  ...

Try changing `p`. What happens? Why?  ...

Try changing `n` to 6. And then play around with `p`. Imagine each support element is a position on a likert scale (add 1 to all the values if it makes you happy). What might `p` represent?

# Sampling using functional programming

Often times, we will want to do things with distributions other than sample from them. The next most complicated thing we'll want to do is: sample from them multiple times. This will require 2 steps:

1. Abstract the procedure: Rather than sample from a Distribution, make a function that samples from that distribution. (A function is a procedure.)
2. Tell the program to repeat that procedure.

We can use the function `repeat` to repeatedly sample. Check it out:

~~~~
webppl("
  var sampleLikert = function () { return sample( Binomial({n:6, p:0.8}) ) + 1 }
  repeat(10, sampleLikert)
")
~~~~

Now inside of our string `"..."`, we've actually written a whole program! In WebPPL, when you declare a new variable, you must write `var varName = ...` On the first line, we have made a new variable called `sampleLikert`. `sampleLikert` is a function (you can tell because it says `= function`). **A function is a procedure that does stuff.** The empty parentheses `()` is where the **arguments** of the function would normally go, but in this case, we've made a function that doesn't take any arguments (this is sometimes called a **thunk**). Inside of the curly-braces `{}` is what the function does. Here, what it does is `sample` from a `Binomial` distribution (with some parameters) and adds 1 to it. 

What we've just done is called *function abstraction*. We've taken a procedure that we want the computer to do (sample from a binomial), and packaged it up into a function `sampleLikert`, which can later be called. This is a basic idea in functional programming.

Rather than call the function, however, we pass it to another function: `repeat`, which ends up calling it 10 times.

Notice that we can't actually call `repeat` on `sample(Binomial( {n:6, p:0.8} ) )`. The reason is that `sample(Binomial({n:6, p:0.8}))` is not a function (it is a *call* to a function, and is actually a sample), and `repeat` wants to repeat **a function**. So what we did here was make a function called `sampleLikert`, and tell repeat to repeat that. 

Technically, we didn't have to make a new function and give it a name. We could have passed `function()...` directly into repeat.

Let's write it that way, and capture the output and visualize it. We'll try it with 1000 samples.

~~~~
x <- webppl("
  repeat(1000, function () { return sample(Binomial( {n:6, p:0.8} )) + 1 } )
")
print(x)
qplot(x)
~~~~

**Challenge problem**: Make a function that samples from 2 Binomials (e.g. with n = 6) and adds them together.
Then, `repeat` the function 1000 times and visualize it.

~~~~
x <- webppl("
  var twoBinomials = ...

")

qplot(x)

~~~~


# Gaussian distribution

Let's take a look at a Gaussian distribution.

A Gaussian has 2 parameters: mean `mu` and standard deviation `sigma` (careful: in some systems, the Gaussian is parameterized by the mean and *variance*... *variance* being the standard deviation squared).

~~~~
webppl("Gaussian( {mu: 0, sigma:1 } ) ")
~~~~

In this situation, WebPPL doesn't give us a pretty probability table. Why not?

The answer has to do with the **support** of the Gaussian distribution. Whereas before, we had a *finite* support (all of the possible outcomes of a coin flip, or several coin flips). The support of a Gaussian is all numbers.. it is *infinite*. That is, every number has some probability under a Gaussian distribution (it may be a very small probability). We can't print out a probability table because the table would be infinitely long!

You may think this is a nit-picky detail, and that we could make some discretization or "binning" to show the distribution. You are right, we could do that. How could we do that? 

Well, we could look up the probability for several (but not infinite) different values. In WebPPL, Distributions come with this ability. We're going to use the function `probability` to look up the probability of a number under a `Gaussian` distribution.

This function is not in the basic WebPPL language, but is in a package we've made for your convenience called `utils`. If you didn't clone the class repo to get this, you can download the folder `utils` from [here](http://web.stanford.edu/class/psych201s/psych201s/practicums/) and be sure to put the folder utils in the same folder as your practica.

~~~~
webppl("
  var x = 0
  probability(x, Gaussian({mu: 0, sigma:1 }))
", packages = c("./utils"))
~~~~

Let's try doing this for several x-values. To do this, we're learn another basic trick from functional programming. If we want to do the same procedure (i.e., apply the same function, e.g. call `probability(..)`) many times to different input values, we can use a  function called `map`. `map` takes in 2 arguments: a function, and a list of values to apply that function to. It returns to you a list of values after the function has been applied. (It's sort of like a for-loop, but not computer scientists would scoff at that remark.)

Because we are passing actual values, we want to make a function that *takes in an argument* (as opposed to repeat, where we made a function with no arguments).

It's worth noting that we can write our WebPPL program in a separte file, and call `webppl` on the file path. Let's try this.

Download [this file](https://raw.githubusercontent.com/mhtess/psych201s/master/practicums/webppl_models/discreteGaussian.wppl), and put it in a folder called `webppl_models` in the folder containing this practicum

You can open that file using RStudio. Chances are: it will open as a Text File (you can tell in the bottom right corner of the editor window). You can change that to JavaScript, and it will highlight syntax for you. For complicated programs, this is incredibly helpful.

(N.B.: RStudio reallys want you to use ; at the end of lines in JavaScript programs. WebPPL doesn't really care, but the RStudio editor will show you a note next to the line if it doesn't have a ;)

~~~~
discreteGaussian <- webppl(
  program_file = "webppl_models/discreteGaussian.wppl", 
  packages = c("./utils")
  )

print(discreteGaussian)

data.frame(
  bins = c(-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5),
  probs = discreteGaussian
) %>%
ggplot(., aes( x = bins, y = probs ) )+
  geom_bar( stat = 'identity', position = position_dodge() )
~~~~

Try varying `mu` and `sigma`.

Now let's make a continuous distribution from samples.

~~~~
webppl("
repeat(
  10000,
  function () { return sample( Gaussian( {mu: 0, sigma:1 } ) ) }
)
", packages = c("./utils")) %>% 
  qplot()+
  xlim(-5,5)
~~~~

# Scientific hypotheses are generative models

So far, we've looked at probability distributions, which describe *uncertainty* about outcomes (like flipping a coin). We, as scientists, can use these distributions to describe *our own uncertainty* about the outcome of an experiment. For example, we might hold the prior belief that there may or may not be an effect (as long as we're honest, and not driven by career-ist motives, the probability of an effect *a priori* for most psychology experiments is 0.5). Okay, then, if there is an effect, we might expect the data to follow a certain distribution. And if there is no effect, we might expect the data to follow a different distribution (or, the same distribution with different parameters, like a Gaussian with mean = 0...).

We have just described a generative model that corresponds to our scientific hypothesis! *Generative models* are simply models that generate data (or, sample predicted data). All we have to do is put the structure of the hypothesis into the generative model. That's all there is to it.

Let's get to work. Using WebPPL, we can **compose** distributions, to form more complex distributions. 

Let's make a model that first samples a Bernoulli (i.e., flips a coin). If the Bernoulli comes up `TRUE` (the coin comes up heads), we'll then sample from a Gaussian with mean = 1, stdev = 1. If the Bernoulli samples is `FALSE` (the coin lands tails), we'll sample from a Gaussian with mean = 0, stdev = 1.

We're gonna have the program return the outcome of the coin flip and the outcome of the resulting Gaussian.

To write `if...else` statements in WebPPL (and JavaScript), we're going to use the shorthand `? :` notation:
`ifClause ? thenClause : elseClause`

~~~~
gaussianMixture <- "
var gaussianMixture = function(){
  var a = sample( Bernoulli({p:0.5}) );
  var b = a ? 
          sample( Gaussian( {mu: 1, sigma:1} )) :
          sample( Gaussian( {mu: 0, sigma:1} ))
  return {coin: a, outcome: b}
}
repeat(1000, gaussianMixture)
"

samples <- webppl(gaussianMixture)

head(samples)
~~~~

We're definitely getting more complicated. We've made a function called `gaussianMixture`, which does all of the things we said above. Notice that the labels we have our variables in the `return` object (i.e., **coin** and **outcome**) are now the headers our data.frame. It will be useful to record data like this (as an objects `{key: value}`, with informative names for `key`).

Cool. Let's visualize this.

~~~~
ggplot(samples, aes(x = outcome, fill = coin))+
  geom_histogram(position = position_dodge())
~~~~

Do you understand what you are seeing? Can you explain it?

Congratulations. You've just bascically set up a t-test. (Actually, this would be a z-test, but it's similar enough).

What do I mean by that? Well, let's replace the labels `a` and `b` in our program with more informative labels.
~~~~
gaussianMixture <- "
var gaussianMixture = function(){
  var isEffect = sample( Bernoulli({p:0.5}) );
  var data = isEffect ? 
          sample( Gaussian( {mu: 1, sigma:1} )) :
          sample( Gaussian( {mu: 0, sigma:1} ))
  return {isEffect: isEffect, data: data}
}
repeat(1000, gaussianMixture)
"
samples <- webppl(gaussianMixture)

ggplot(samples, aes(x = data, fill = isEffect))+
  geom_histogram(position = position_dodge())
~~~~

Exactly the same model just with different labels on the variables. This distribution (which is actually a 50 \ 50 mixture of 2 distributions) could encode our prior beliefs about the data in an experiment we're about to run. If there is an effect, we are expecting the data to be normally distributed around 1. If there isn't an effect, we would expect the data to be noramlly distributed around 0. And we don't know whether or not there will be an effect, so have uncertainty about that.

Technically, `isEffect` is a latent, or hidden, parameter. We can't actually observe it in the world. So, really we shouldn't look at it.

~~~~
ggplot(samples, aes(x = data))+
  geom_histogram(binwidth = 0.15)
~~~~

It's actually super hard to tell there are two disributions here without the color variable. Note the peak is not at 0, but it's at about 0.5, because if we don't know if there's an effect or not, the most likely thing is for the data to be somewhere in between the means of the two distributions. (Go back to the color plot and confirm that's the case. In the color plot, the distributions are **dodged**, so you have to add bars that are next to each other).

This generative model (and the resulting **Predictive distribution**) encodes a hypothesis that either the data comes from a Gaussian with mean 0, or a Gaussian with mean 1. Next meeting, we will see how we can go from this *prior belief distribution* to a *posterior belief distrbution* after observing data.

Let's consider one more case.

Here we'll consider two possibilities again, and hence we'll start by flipping a coin (sampling a Bernoulli). If it lands on heads, we'll sample a coin weight from a Uniform distribution over [0, 1]. If it lands on tails, we will take the coin weight 0.5.

Then, we'll flip that second coin (whatever the weight is).

~~~~
binomialMixture <- "
var binomialMixture = function(){
  var isEffect = sample( Bernoulli({p:0.5}) );
  var trueEffect = isEffect ? 
          sample( Uniform( {a: 0, b:1} )) :
          0.5
  var data = sample( Bernoulli( { p: trueEffect } ) );
  return {isEffect: isEffect, trueEffect:trueEffect, data: data}
}
repeat(10000, binomialMixture)
"

samples <- webppl(binomialMixture)

ggplot(samples, aes(x = as.numeric(data), fill = isEffect))+
  geom_histogram(position = position_dodge())

~~~~

It's interesting here that our two hypotheses (coin weight is 0.5; coin weight is sampled from a uniform) don't predict any different data.

What does `trueEffect` look like?

~~~~
ggplot(samples, aes(x = trueEffect, fill = isEffect))+
  geom_histogram(position = position_dodge())
~~~~

Right, if there no effect, the trueEffect is 0.5. If there is an effect, then it could be anything between 0 and 1.

This is the setup for a Binomial Test. What we will want to know if we observe 75% heads, how much do we believe that there is an effect. That is for the next chapter.


**Challenge problem**

In the gaussianMixture model above, we assumed that if there was an effect, the data would come from a gaussian centered at 1. The more general case that we often do in a t-test is to say that the alternative hypothesis means that data is coming from a gaussian that's NOT centered at 0. (H_a: mu != 0... you may recall). Of course, we might not expect the alternative hypothsis to include certain values (our data might come from a scale that has upper and lower bounds; we might be talking about Reaction Times, in which case, negative numbers would be weird, as would numbers on the order of minutes...).

Try to write a model where, when there is an effect, we sample a value for `mu` from a Gaussian centenred at 0 with a big stdev (like 10) [sort of like how we did for the binomialMixture]. Call this variable `trueMean`. When there is no effect, we'll set `trueMean` to be 0.

~~~~
gaussianMixture <- "
var gaussianMixture = function(){
  var isEffect = sample( Bernoulli({p:0.5}) );

  var trueMean = isEffect ? ... :
                            ...

  var data = sample( Gaussian( {mu: trueMean, sigma:1} ))

  return {isEffect: isEffect, trueMean: trueMean, data: data}
}
repeat(10000, gaussianMixture)
"
samples <- webppl(gaussianMixture)

ggplot(samples, aes(x = data, fill = isEffect))+
  geom_histogram(position = position_dodge())
~~~~


