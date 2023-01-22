---
layout: exercise
title: "Algorithms for Inference - readings"
description: "MCMC, Gibbs, Metropolis Hastings, Particle Filters, Variational Bayes" 
---

## 1. Discussion of MCMC

@T.L.Griffiths:2008:dd194 - Sec. 5.0 Markov Chain Monte Carlo (pp. 31-34)

#### Reading questions:

a) Under what conditions is it *not* necessary to use an approximate sampling method to solve a Bayesian equation?

b) What are the major differences between Gibbs sampling and Metropolis-Hastings sampling? 

## 2. Particle filters

[Particle Filters Explained without Equations](https://www.youtube.com/watch?v=aUkBa1zMKv4)

#### Viewing questions:

a) As the number of particles increases, what happens to a particle filter's accuracy? What happens to its run-time? Would you want an infinite number of particles? Why or why not?

b) Describe a phenomenon that particle filters be particularly good for modeling. Why do you think a particle filter would be helpful?

## 3. Evolutionary algorithms, Bayesian inference, and the mind

@suchow2017evolution

#### Reading questions:

a) In what way is evolutionary dynamics like Bayesian inference?

b) A number of different inference algorithms are discussed. What are the consequences of one of them being used for a particular process (like working memory) as opposed to another one?

## Extras
### Extra math
**Algorithms for Inference** For a somewhat longer, mathier disucssion of MCMC algorithms, see @andrieu2003introduction.

### Extra applications
**One and Done** :One concern about Bayesian models is that inference takes too long. But what if you actually didn't need to run MCMC that long? @vul2014one

**Perceptual instability as MCMC** Could sampling explain perceptual instability? @gershman2009perceptual