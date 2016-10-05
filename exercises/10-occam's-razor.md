---
layout: exercise
title: Occam's razor - exercises
---

## Exercise 1: Causal induction

Write the causal support model from Griffiths and Tenenbaum's [-@Griffiths2005], "Structure and strength in causal induction" (GT05) in Church.  You don't need to compute the log likelihood ratio for $$P(\text{data} \mid \text{Graph 1})/P(\text{data} \mid \text{Graph 0})$$ but can simply estimate the posterior probability $$P(\text{Graph 1} \mid \text{data})$$.

a) Replicate the model predictions from Fig. 1 of GT05.

b) Show samples from the posteriors over the causal strength and background rate
parameters, as in Fig 4 of GT05.

c) Try using different parameterizations of the function that relates the cause and the background to the effect, as described in a later 2009 paper [@Griffiths2009]: noisy-or for generative causes, noisy-and-not for preventive causes, generic multinomial parameterization for causes that have an unknown effect.  Show their predictions for a few different data sets, including the Delta-P = 0 cases.

## Exercise 2

Try an informal behavioral experiment with several friends as experimental subjects to see whether the Bayesian approach to curve fitting given on the wiki page corresponds with how people actually find functional patterns in sparse noisy data.  Your experiment should consist of showing each of 4-6 people 8-10 data sets (sets of x-y values, illustrated graphically as points on a plane with x and y axes), and asking them to draw a continuous function that interpolates between the data points and extrapolates at least a short distance beyond them (as far as people feel comfortable extrapolating).  Explain to people that the data were produced by measuring y as some function of x, with the possibility of noise in the measurements.

The challenge of this exercise comes in choosing the data sets you will show people, interpreting the results and thinking about how to modify or improve a probabilistic program for curve fitting to better explain what people do. Of the 8-10 data sets you use, devise several ("type A") for which you believe the church program for polynomial curve fitting will match the functions people draw, at least qualitatively.  Come up with several other data sets ("type B") for which you expect people to draw qualitatively different functions than the church polynomial fitting program does. Does your experiment bear out your guesses about type A and type B?  If yes, why do you think people found different functions to best explain the type B data sets?  If not, why did you think they would?  There are a number of factors to consider, but two important ones are the noise model you use, and the choice of basis functions: not all functions that people can learn or that describe natural processes in the world can be well described in terms of polynomials; other types of functions may need to be considered.

Can you modify the church program to fit curves of qualitatively different forms besides polynomials, but of roughly equal complexity in terms of numbers of free parameters?  Even if you can't get inference to work well for these cases, show some samples from the generative model that suggest how the program might capture classes of human-learnable functions other than polynomials.

You should hand in the data sets you used for the informal experiment, discussion of the experimental results, and a modified church program for fitting qualitatively different forms from polynomials plus samples from running the program forward.

## Exercise 3: Number game

Write the *number game* model from Tenenbaum's [-@Tenenbaum2000] "Rules and similarity in concept learning" in Church.

Replicate the model predictions in Fig. 1b. You may want to start by writing out the hypotheses by hand.

How might you generate the hypothesis space more compactly?

How would you change the model if the numbers were sequences instead of sets?

Hint: to draw from a set of integers, you may want to use this `noisy-draw` function:

~~~~
;;the total possible range is 0 to  total-range - 1
(define total-range 10)

;;draw from a set of integers with some chance of drawing a different integer in the possible range:
(define (noisy-draw set) (sample-discrete (map (lambda (x) (if (member x set) 1.0 0.01)) (iota total-range))))

;;for example:
(noisy-draw '(1 3 5))
~~~~
