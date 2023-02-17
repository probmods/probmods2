---
layout: exercise
title: "Algorithms for Inference - readings"
description: "MCMC, Gibbs, Metropolis Hastings, Particle Filters, Variational Bayes" 
---

## 1. Algorithmic-level theories

Read "[Evolution in mind: Evolutionary dynamics, cognitive processes, and Bayesian inference](https://suchow.io/assets/docs/suchow2017tics.pdf)" by Jordan Suchow, David Bourgin, and Tom Griffiths. 

#### Reading questions:

a) Suchow and colleagues suggest particle filters are a useful way of thinking about maintenance in working memory, that in fact particle filters are simply a good engineering design for working memory. Why would rejection sampling not work? What about Metropolis-Hastings?

ChatGPT actually makes some useful points about the three sampling methods, but doesn't really tie the argument together. Still, you might find it a useful place to start:

> Suhcow and colleagues suggest that particle filters, which are commonly used in the field of engineering for state estimation and tracking, can be seen as a useful model for understanding maintenance in working memory. In this model, working memory is represented as a set of particles, or possible states, that are continuously updated based on incoming sensory information.

> Rejection sampling is a technique used in statistics to generate samples from a probability distribution. It involves sampling from a proposal distribution and then rejecting samples that do not meet certain criteria. While this approach could potentially be used to model working memory maintenance, it is less efficient than particle filters because it requires a large number of samples to be generated in order to obtain an accurate representation of the underlying distribution.

> Metropolis-Hastings is another statistical technique used to generate samples from a probability distribution. It involves iteratively generating new samples based on a proposal distribution and accepting or rejecting them based on a specified acceptance criterion. While this approach could be used to model working memory maintenance, it can be computationally expensive and requires careful tuning of the proposal distribution and acceptance criterion to ensure accurate sampling.

> In contrast, particle filters are designed to efficiently track and estimate the state of a system over time, and are well-suited to modeling the continuous updates and maintenance processes involved in working memory. They are computationally efficient and do not require as much fine-tuning as other statistical techniques, making them a useful engineering design for working memory.

PS ChatGPT really did misspell "Suchow". It is not entirely clear what to make of that.

b) Suchow and colleagues suggest that Metropolis-Hastings may be a useful way of thinking about creativity, that in fact Metropolis-Hastings may be a useful way of *instantiating* creativity. Why would it work better than rejections sampling? Than particle filters?

ChatGPT's answer was pretty similar in form to the one for (a), so it is not copied here. 

## 2. Discussion of MCMC

Read Sec. 5 (``Markov Chain Monte Carlo'') of [Bayesian models of cognition](https://kilthub.cmu.edu/articles/journal_contribution/Bayesian_models_of_cognition/6613682/1/files/12106358.pdf) by Tom Griffiths, Charles Kemp, and Josh Tenenbaum.

#### Reading questions:

a) Under what conditions is it *not* necessary to use an approximate sampling method to solve a Bayesian equation?

b) What are the major differences between Gibbs sampling and Metropolis-Hastings sampling? 


## Extras
### Extra modeling
* **[Empmirical evidence for Markov Chain Monte Carlo in Memory Search](https://escholarship.org/content/qt72r6n6cn/qt72r6n6cn.pdf)** A short paper describing a model closely related to the memory model discussed by Suchow and colleagues. Although it's short, it goes into the math in a bit more detail, which may be helpful.

### Extra math
* **Algorithms for Inference** For a somewhat longer, mathier discussion of MCMC algorithms, see @andrieu2003introduction.

* **[Gibbs sampling for the uninitiated](http://users.umiacs.umd.edu/~resnik/pubs/LAMP-TR-153.pdf)** Gibbs sampling is not really covered in this chapter, but it is important. Readers who want to know more can consult this text.

* **More WebPPL**. The WebPPL textbook [this overview](http://www.problang.org/chapters/app-06-intro-to-webppl.html) has chapters on [Particle Filtering](http://dippl.org/chapters/05-particlefilter.html) as well as [Markov Chain Monte Carlo](http://dippl.org/chapters/06-mcmc.html) (MCMC).