---
layout: exercise
title: Models for sequences of observations
description: Generative models of the relations between data points
---

## 1. Author identification with n-grams

Markov models -- which we encountered in the chapter -- track transitions from one state to the next. This can also be thought of a Bayesian bigram model. Bigrams models are created by counting the frequencies of word pairs in a corpus in order to predict what word is most likely to follow what other word.

A generalization of the bigram model is the N-gram model, which keeps track of tuples up to length N. Although N-gram models are very simple, they can be surprisingly useful. For an example, see @kevselj2003n.

#### Reading questions

a) One reading of this paper is that authors literally write texts by sampling an internal N-gram model. This seems unlikely. More likely is that N-grams pick up on some other, more complex feature of an author's "style". What might this be?

b) When Markov models or N-gram models are applied to language, which of Marr's levels do you think these models are (or should be) aimed at? 

## Extras

* **Markov Models**. [Chapter 8](../assets/pdfs/MarkovModels.pdf) of Michael Hammond's apparently unpublished textbook reviews somewhat more systematically some of the concepts we encountered in the chapter. You may also find [this video](https://www.youtube.com/watch?v=pHpZzH7b9ys) helpful. 