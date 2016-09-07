---
layout: chapter
title: Generative models
description: Generative models
---

## Exercise 1

Here are three WebPPL programs:

~~~~
flip() ? flip(.7) : flip(.1)
~~~~

~~~~
flip(flip() ? .7 : .1)
~~~~

~~~~
flip(.4)
~~~~

a) Show that the marginal distribution on return values for these three programs is the same by directly computing the probability using the rules of probability (hint: write down each possible history of random choices for each program). Check your answers by sampling from the programs.

b)  Explain why these different-looking programs can give the same results.

## Exercise 2

Explain why (in terms of the evaluation process) these two programs give different answers (i.e. have different distributions on return values):

~~~~
var foo = flip();
display([foo, foo, foo]);
~~~~

~~~~
var foo = function() {return flip()};
display([foo(), foo(), foo()]);
~~~~

## Exercise 3

In the simple medical diagnosis example we imagined a generative process for the diseases and symptoms of a single patient. If we wanted to represent the diseases of many patients we might have tried to make each disease and symptom into a ''function'' from a person to whether they have that disease, like this:

~~~~
var lungCancer = function(person) {return flip(.01)};
var cold = function(person) {return flip(.2)}

var cough = function(person) {return cold(person) || lungCancer(person)}

display([cough('bob'), cough('alice')])
~~~~

Why doesn't this work correctly if we try to do the same thing for the more complex medical diagnosis example? How could we fix it?

## Exercise 4

Work through the evaluation process for the `bend` higher-order function in this example:

~~~~
var makeCoin = function(weight) {
  return function() {
    return flip(weight) ? 'h' : 't';
  }
}
var bend = function(coin) {
  return function() {
    return coin() == 'h' ? makeCoin(.7)() : makeCoin(.1)();
}

var fairCoin = makeCoin(.5)
var bentCoin = bend(fairCoin);

viz.auto(repeat(100, bentCoin))
~~~~

Directly compute the probability of the bent coin in the example. Check your answer by comparing to the histogram of many samples.

## Exercise 5

Here is a modified version of the tug of war game. Instead of drawing strength from the continuous Gaussian distribution, strength is either 5 or 10 with equal probability. Also the probability of laziness is changed from 1/4 to 1/3. Here are four expressions you could evaluate using this modified model:

~~~~ 
    (define strength (mem (lambda (person) (if (flip) 5 10))))

    (define lazy (lambda (person) (flip (/ 1 3))))

    (define (total-pulling team)
      (sum
       (map (lambda (person) (if (lazy person) (/ (strength person) 2) (strength person)))
            team)))

    (define (winner team1 team2) (if (< (total-pulling team1) (total-pulling team2)) team2 team1))

    (winner '(alice) '(bob))                        ;; expression 1

    (equal? '(alice) (winner '(alice) '(bob)))      ;; expression 2

    (and (equal? '(alice) (winner '(alice) '(bob))) ;; expression 3
         (equal? '(alice) (winner '(alice) '(fred))))

    (and (equal? '(alice) (winner '(alice) '(bob))) ;; expression 4
         (equal? '(jane) (winner '(jane) '(fred))))
~~~~

a) Write down the sequence of expression evaluations and random choices that will be made in evaluating each expression.

b) Directly compute the probability for each possible return value from each expression.

c) Why are the probabilities different for the last two? Explain both in terms of the probability calculations you did and in terms of the "causal" process of evaluating and making random choices.

## Exercise 6

Use the rules of probability, described above, to compute the probability that the geometric distribution defined by the following stochastic recursion returns the number 5.

~~~~ 
    (define (geometric p)
      (if (flip p)
          0
          (+ 1 (geometric p))))
~~~~

## Exercise 7

Convert the following probability table to a compact Church program:

|A|    B|    P(A,B)|
|--- | --- | ---|
|F|      F|     0.14|
|F|      T|     0.06|
|T|      F|     0.4|
|T|      T|     0.4|

<!--
<table>
  <tr>
    <th>A</th> <th>B</th> <th>P(A,B)</th>
  </tr>
  <tr>
    <td>F</td> <td>F</td> <td>0.14</td>
  </tr>
  <tr>
    <td>F</td> <td>T</td> <td>0.06</td>
  </tr>
  <tr>
    <td>T</td> <td>F</td> <td>0.4</td>
  </tr>
  <tr>
    <td>T</td> <td>T</td> <td>0.4</td>
  </tr>
</table>
-->										
Hint: fix the probability of A and then define the probability of B to *depend* on whether A is true or not. Run your Church program and build a histogram to check that you get the correct distribution

~~~~ 
    (define a ...)
    (define b ...)
    (list a b)
~~~~

## Exercise 8

In [Example: Intuitive physics] above we modeled stability of a tower as the probability that the tower falls when perturbed, and we modeled "falling" as getting shorter. It would be reasonable to instead measure *how much shorter* the tower gets.

a) Below, modify the stability model by writing a continuous measure, `towerFallDegree`. Make sure that your continuous measure is in some way numerically comparable to the discrete measure, `doesTowerFall` (defined here as either 0 or 1). Mathematically, what is your continuous measure?

~~~~ 
    (define (getWidth worldObj) (first (third (first worldObj))))
    (define (getHeight worldObj) (second (third (first worldObj))))
    (define (getX worldObj) (first (second worldObj)))
    (define (getY worldObj) (second (second worldObj)))
    (define (getIsStatic worldObj) (second (first worldObj)))

    (define ground
      (list (list "rect" #t (list worldWidth 10)) (list (/ worldWidth 2) (+ worldHeight 6))))

    (define almostUnstableWorld
      (list ground (list (list 'rect #f (list 24 22)) (list 175 473))
            (list (list 'rect #f (list 15 38)) (list 159.97995044874122 413))
            (list (list 'rect #f (list 11 35)) (list 166.91912737427202 340))
            (list (list 'rect #f (list 11 29)) (list 177.26195677111082 276))
            (list (list 'rect #f (list 11 17)) (list 168.51354470809122 230))))

    (define (noisify world)
      (define (xNoise worldObj)
        (define noiseWidth 10) ;how many pixels away from the original xpos can we go?
        (define (newX x) (uniform (- x noiseWidth) (+ x noiseWidth)))
        (if (getIsStatic worldObj)
            worldObj
            (list (first worldObj)
                  (list (newX (getX worldObj)) (getY worldObj)))))
      (map xNoise world))

    (define (boolean->number x) (if x 1 0))

    ;; round a number, x, to n decimal places
    (define (decimals x n)
      (define a (expt 10 n))
      (/ (round (* x a)) a))

    (define (highestY world) (apply min (map getY world))) ;; y = 0 is at the TOP of the screen

    ;; get the height of the tower in a world
    (define (getTowerHeight world) (- worldHeight (highestY world)))

    ;; 0 if tower falls, 1 if it stands
    (define (doesTowerFall initialW finalW)
      (define eps 1) ;things might move around a little, but within 1 pixel is close
      (define (approxEqual a b) (< (abs (- a b)) eps))
      (boolean->number (approxEqual (highestY initialW) (highestY finalW))))


    (define (towerFallDegree initialW finalW)
      ;; FILL THIS PART IN
      -999)

    ;; visualize stability measure value and animation
    (define (visualizeStabilityMeasure measureFunction)
      (define initialWorld (noisify almostUnstableWorld))
      (define finalWorld (runPhysics 1000 initialWorld))
      (define measureValue (measureFunction initialWorld finalWorld))

      (display (list "Stability measure: "
                                    (decimals measureValue 2) "//"
                                    "Initial height: "
                                    (decimals (getTowerHeight initialWorld) 2) "//"
                                    "Final height: "
                                    (decimals (getTowerHeight finalWorld) 2)))
      (animatePhysics 1000 initialWorld))

    ;; visualize doesTowerFall measure
    ;;(visualizeStabilityMeasure doesTowerFall)

    ;; visualize towerFallDegree measure
    (visualizeStabilityMeasure towerFallDegree)
~~~~

b) Are there worlds where your new model makes very different predictions about stability from the original model? Which best captures the meaning of "stable"? (it might be useful to actually code up your worlds and test them).


