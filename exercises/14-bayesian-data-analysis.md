---
layout: exercise
title: Bayesian Data Analysis - exercises
custom_js:
- assets/js/towData.js
- assets/js/towConfigurations.js
---

## Exercise 1: Subjective randomness digest

We saw in this chapter how to analyze our Bayesian models of cognition by using Bayesian statistical techniques. Pick either the enriched bias coin model or the generalized enriched bias coin model. What phenomena was it able to capture? What wasn’t it able to capture? How can you tell? Do you have an idea for a better model?

## Exercise 2: Experimenting with priors and predictives

In [our simple binomial model]({{site.baseurl}}/chapters/14-bayesian-data-analysis.html#a-simple-illustration), we compared the parameter priors and posteriors to the corresponding **predictives** which tell us what data we should expect given our prior and posterior beliefs. For convenience, we've reproduced that model here:

~~~~
// observed data
var k = 1 // number of successes
var n = 20  // number of attempts

var model = function() {

   var p = uniform(0, 1);

   // Observed k number of successes, assuming a binomial
   observe(Binomial({p : p, n: n}), k);

   // sample from binomial with updated p
   var posteriorPredictive = binomial(p, n);

   // sample fresh p
   var prior_p = uniform(0, 1);
   // sample from binomial with fresh p
   var priorPredictive = binomial(prior_p, n);

   return {
       prior: prior_p, priorPredictive : priorPredictive,
       posterior : p, posteriorPredictive : posteriorPredictive
    };
}

var opts = {method: "rejection", samples: 2000};
var posterior = Infer(opts, model);

viz.marginals(posterior)
~~~~

a. Notice that we used a uniform distribution over the interval [0,1] as our prior, reflecting our assumption that a probability must lie between 0 and 1 but otherwise remaining agnostic to which values are most likely to be the case. While this is convenient, we may want to build in other *a priori* beliefs, such as the empirical fact that votes tend to be close to 50\%. The [Beta distribution](https://en.wikipedia.org/wiki/Beta_distribution) is a general way of expressing beliefs over the interval [0,1].

Try different priors on `p`, by changing `p = uniform(0, 1)` to `p = beta(10,10)`, `beta(1,5)` and `beta(0.1,0.1)`. Use the figures produced to understand the assumptions these priors capture, and how they interact with the same data to produce posterior inferences and predictions.

b. Predictive distributions are not restricted to exactly the same experiment as the observed data, and can be used in the context of any experiment where the inferred model parameters make predictions. In the current simple binomial setting, for example, predictive distributions could be found by an experiment that is different because it has `n' != n` observations. Change the model to implement an example of this.


<--
## Exercise 2: Bayes in the head vs. Bayes in the notebook.

We’ve seen in this chapter how we can precisely separate assumptions about our computational-level theory of cognition from the assumptions that go into analyzing our data (and our theory). In this exercise, we will try to go between the two ways of looking at these things: by going from a theory and analysis in words, to a theory and analysis in Church (and back).

Consider the [reflectance and luminance model](https://probmods.org/v2/chapters/04-patterns-of-inference.html#a-case-study-in-modularity-visual-perception-of-surface-color) from Chapter 4. This model captured the illusion of increased reflectance in terms of explaining away the observed luminance by the observed decrease in illumination (caused by the shadow). Here is the model again

~~~~
var observedLuminance = 3;

var reflectancePosterior = Infer({method: 'MCMC', samples: 10000}, function() {
  var reflectance = gaussian({mu: 1, sigma: 1})
  var illumination = gaussian({mu: 3, sigma: 1})
  var luminance = reflectance * illumination
  // observe(Gaussian({mu: luminance, sigma: 1}), observedLuminance) // observe luminance
  // observe(Gaussian({mu: 0.5, sigma: 1}), illumination); // observe shadow
  return reflectance
});

print(expectation(reflectancePosterior))
viz(reflectancePosterior)
~~~~

A. Warmup: What does the prior for reflectance look like? How does the posterior shift when we observe luminance? What happens when you observe the shadow as well?

B. How many parameters does this model of perception have? (Hint: Go through each `var` and `observe` statement: Are the constituent variables of the statements (a) modeling assumptions or (b) part of the experimental setup / manipulation) For all of the variables you’ve categorized as (a), which ones do you think refer to aspects of the perceptual system and which refer to aspects of the environment? What do you think these parameters represent in terms of the perceptual system or environment? (Feel free to use super general, even colloquial, terms to answer this.)

C. Replace the hard-coded parameters of this model with variables, defined outside the query. Give them the most intuitive names you can fashion. Use this starter (pseudo) code.

~~~~
var parameter1 = ...
var parameter2 = ...
// ...

var observedLuminance = 3;

var reflectancePosterior = Infer({method: 'MCMC', samples: 10000}, function() {
  var reflectance = gaussian({mu: 1, sigma: 1})
  var illumination = gaussian({mu: 3, sigma: 1})
  var luminance = reflectance * illumination
  // observe luminance
  observe(Gaussian({mu: luminance, sigma: 1}), observedLuminance) 
  return reflectance
});

print(expectation(reflectancePosterior))
viz(reflectancePosterior)
~~~~

D. Are all of these parameters independent? (If you had to specify values for them, would you have to consider values of other parameters when specifying them?) If two are not independent, can you think of a reparameterization that would be more independent? (Hint: If you have two non-independent parameters, you could keep only one of them and introduce a parameter specifying the relation between the two. E.g., two points that are linearly associated can be expressed as an one of them and the distance between them).

E. Writing data analysis models requires specifying priors over parameters. Without much prior knowledge in a domain, we want to pick priors that make the fewest assumptions. A good place to start is to think about the possible values the parameter could take on. **For each parameter, write down what you know about the possible values it could take on.

F. We’re now in a position to write a data analysis model. The most common distributional forms for priors are uniform, gaussian, beta, and exponential. Put priors on your parameters from part C. Use this starter (pseudo) code.

~~~~
(define perceptual-model
  (lambda (parameter1 parameter2 ...))
  (query

   ; fill in, copying where appropriate from the original model specification
   (define reflectance ...)
   (define illumination ...)
   (define luminance (* reflectance illumination))

   reflectance

   (= luminance ...))))



(define data-analysis-model
  (query
   ; replace with parameters you specified in Part C
   ; put priors over parameters
   (define parameter1 ...)
   (define parameter2 ...)
   (define ...)
   (define perceptual-model-predictions 
     (perceptual-model parameter1 parameter2 ...))
    
   ;;; what are you going to query for?
   ...  
   
   (condition (= experimental-data perceptual-model-predictions))))

~~~~

G. What are you going to query for? Add it to your pseudocode above. What do each of things that you are querying for in the data analysis model represent?
-->

## Exercise 3: Parameter fitting vs. Parameter integration

One of the strongest motivations for using Bayesian techniques for model-data evaluation is in how “nuisance” parameters are treated. “Nuisance” parameters are parameters of no theoretical interest; their only purpose is to fill in a necessary slot in the model. Classically, the most prominant technique (from the frequentist tradition) for dealing with these parameters is to fit them to the data, i.e., to set their value equal to whatever value maximizes the model-data fit (or, equivalently, minimizes some cost function).

The Bayesian approach is different. Since we have a priori uncertainty about the value of our parameter (e.g. as you specified in Part F of Exercise 2), we will also have a posteriori uncertainty about the value (though hopefully the uncertainty will be a little less). What the Bayesian does is integrate over her posterior distribution of parameter values to make predictions. Intuitively, rather than taking the value corresponding to the peak of the distribution, she’s considering all values with their respective probabilites.

Why might this be important for model assessment? Imagine the following situation. You are piloting a task. You think that the task you’ve design is a little too difficult for subjects. (Let’s imagine that you’re a psychophysicist, and your task pertains to contrast discriminiation in the periphery.) You think the current task design is too difficult, but you’re uncertain. It may well be that it’s fine for subjects. We’re going to think about this in terms of subjects ability with respect to your task. Here is your prior.

~~~~
;; Prior on task diffuclty is uniform on 0..0.9, with a spike on 0.9

(define (task-difficulty-prior)
  (if (flip) .9 (/ (sample-integer 10) 10)))

(barplot (enumeration-query (task-difficulty-prior) true) 
         "Prior on task difficulty")

~~~~

You have a model of how subjects perform on your task. You could have a structured, probabilistic model here. For simplicity, let’s assume you have the simplest model of task performance: it is a direct function of task-difficulty (define subject-perform-well? (not (flip task-difficulty))). Subjects perform well if the task isn’t too difficult. This is just a proxy for a more complicated model of inference we could have. For example, you could imagine having some notion of task-difficulty for the model used in Exercise 2.

Let’s say there’s a lot of training involved in your task, such that it’s very time consuming for you to collect data. You run one subject through your training regime and have them do the task. That subject performs well. The same day, your adviser (or funding agency) wants you to make a decision to collect more data or not (or switch up something about your paradigm). You thought beforehand that your task was too difficult. Do you still think your task is too hard?

One way to address this is to look at the posterior over your task-difficulty parameter. How does your degree of belief in subject-ability change as a result of your one pilot subject performing well?

~~~~
;;;fold:
(define (expectation ps vs)
  (if (= (length ps) 0)
      0      
      (+ (* (first ps) (first vs))
         (expectation (rest ps) (rest vs)))))

(define (%most-probable-value vs ps best-v best-p)
  (if (= (length ps) 0)
      best-v
      (if (> (first ps) best-p)
          (%most-probable-value (rest vs) (rest ps) (first vs) (first ps))
          (%most-probable-value (rest vs) (rest ps) best-v best-p))))

(define (most-probable-value vs ps)
  (%most-probable-value vs ps 0 0))

;; Prior on task diffuclty is uniform on 0..0.9, with a spike on 0.9

(define (task-difficulty-prior)
  (if (flip) .9 (/ (sample-integer 10) 10)))

(barplot (enumeration-query (task-difficulty-prior) true) 
         "Prior on task difficulty")


;; Compute posterior after seeing one subject perform well on the task 

(define task-difficulty-posterior-dist
  (enumeration-query
   (define task-difficulty (task-difficulty-prior))   
   ; subject will perform well if the task is not too difficult
   (define subject-performs-well? (not (flip task-difficulty)))

   task-difficulty

   (condition (equal? subject-performs-well? #t))))


;; Most likely task-difficulty is still .9

(display "Most probable task-difficult after seeing 'one subject pass':" 
         (apply most-probable-value task-difficulty-posterior-dist))


;; But a lot of probability mass is on higher values

(barplot task-difficulty-posterior-dist
         "Posterior task-difficulty after observing 'one subject perform well'")


;; Indeed, the expected subject ability is around .5

(display "Expected coin weight after seeing 'one subject perform well':" 
         (apply expectation task-difficulty-posterior-dist))
~~~~

A. Would you proceed with more data collection or would you change your paradigm? How did you come to this conclusion?

B. In part A, you probably used either a value of task-difficulty or the full distribution of values to decide about whether to continue data collection or tweak the paradigm. We find ourselves with a similar decision when we have models of psychological phenomena and want to decide whether or not the model has fit the data (or, equivalently, whether our psychological theory is capturing the phenomenon). The traditional approach is the value (or “point-wise estimate”) approach: take the value that corresponds to the best fit (e.g. by using least-squares or maximum-likelihood estimation; here, you would have taken the Maximum A Posteriori (or, MAP) estimate, which would be 0.9). Why might this not be a good idea? Provide two answers. One that applies to the data collection situation above, and one that applies to the metaphor of model or theory evaluation.

## Exercise 4

Let’s continue to explore the inferences you (as a scientist) can draw from the posterior over parameter values. This posterior can give you an idea of whether or not your model is well-behaved. In other words, do the predictoins of your model depend heavily on the exact parameter value?

To help us understand how to examine posteriors over parameter settings, we’re going to revisit the example of the blicket detector from Chapter 4.

Here is the model, with slightly different names than the original example, and written in a parameter-friendly way. It is set up to display the “backwards blocking” phenomenon.

~~~~
(define blicket-base-rate 0.2)
(define blicket-power 0.9)
(define non-blicket-power 0.05)
(define machine-spontaneously-goes-off 0.05)

(define detecting-blickets
  (lambda 
    (evidence)

    (enumeration-query

     ; some objects are blickets
     (define blicket (mem (lambda (block) (flip blicket-base-rate))))

     ; some blocks have the power to make the box go off
     (define block-power (lambda (block) (if (blicket block) blicket-power non-blicket-power)))

     ; sometimes the machine goes off spontaneously
     ; otherwise, goes off if one of the blocks has the ability to make it go off (sequentially evaluated)

     (define machine-goes-off
       (lambda (blocks)
         (if (null? blocks)
             (flip machine-spontaneously-goes-off)
             (or (flip (block-power (first blocks)))
                 (machine-goes-off (rest blocks))))))

     (blicket 'A)

     ; all checks to make sure all are true; i.e. all the of the lists of blickets made the machine-go-off
     (all (map machine-goes-off evidence)))))

; A&B make the blicket-detector go off
(barplot (detecting-blickets (list (list 'A 'B))) 
         "Is A a blicket, given A&B works?")
; A&B make the blicket-detector go off, and then B makes the blicket detector go off
(barplot (detecting-blickets (list (list 'A 'B) (list 'B))) 
         "Is A a blicket, given A&B works, and B works?")
~~~~

A. What are the parameters of this model? In the plainest English you can muster, interpret the current values of the parameters. What do they mean?

Let’s analyze this model with respect to some data. First, we’ll put priors on these parameters, and then we’ll do inference, conditioning on some data we might have collected in an experiment on 4 year olds, a la Sobel, Tenenbaum, & Gopnik (2004). [The data used in this exercise is schematic data].

~~~~
(define (get-indices needle haystack)
  (define (loop rest-of-haystack index)
    (if (null? rest-of-haystack) '()
        (let ((rest-of-indices (loop (rest rest-of-haystack) (+ index 1))))
          (if (equal? (first rest-of-haystack) needle)
              (pair index rest-of-indices)
              rest-of-indices))))
  (loop haystack 1))

(define discretize-beta 
  (lambda (gamma delta bins)
    (define shape_alpha (* gamma delta))
    (define shape_beta (* (- 1 gamma) delta))
    (define beta-pdf (lambda (x) 
                       (*
                        (pow x (- shape_alpha 1))
                        (pow (- 1 x) (- shape_beta 1)))))
    (map beta-pdf bins)))

(define get-probability
  (lambda (dist selection)
    (define index (list-index (first dist) selection))
    (list-ref (second dist) index)))

(define expval-from-enum-analysis-of-enum-model 
  (lambda (results)
    (map sum 
         (transpose (map 
                     (lambda (lst prob)
                       (map (lambda (x)
                              (* prob x))
                            (second lst)))
                     (first results)
                     (second results))))))


(define expval-from-mh-analysis-of-enum-model 
  (lambda (results)
    (map mean 
         (transpose 
          (map second results)))))

(define make-bins
  (lambda (lowerbound upperbound gap)
    (define effective-ub (+ 1 (round (/ (- upperbound lowerbound) gap))))
    (define effective-range (range (round (* 10 lowerbound)) effective-ub))
    (define binned-range (map (lambda (x) (+ (* (position effective-range x)
                                                gap)
                                             lowerbound))
                              effective-range))
    (filter (lambda (x) (<= x 1)) binned-range)))

; returns a sample from a discretized beta with mean gamma and stdev delta
; (disc-beta 0.5 2 bins) = (uniform-draw bins)
(define disc-beta 
  (lambda (gamma delta bins)
    (multinomial bins (discretize-beta gamma delta bins))))


(define (marginalize output)
  (let ([states (first output)])
    (map (lambda (sub-output) 
           (let* ([probs (second output)]
                  [unique-states (unique sub-output)]
                  [unique-state-indices 
                   (map 
                    (lambda (x) (list x (get-indices x sub-output))) 
                    unique-states)])

             (list (map first unique-state-indices)
                   (map 
                    (lambda (y) (sum (map 
                                      (lambda (x) (list-elt probs x)) 
                                      (second y)))) 
                    unique-state-indices))))

         (transpose states))))

(define summarize-data 
  (lambda (dataset)
    (list (first dataset)
          (map 
           (lambda (lst) (mean (map boolean->number lst)))
           (second dataset)))))


(define summarize-model
  (lambda (modelpreds)
    (list 
     possible-evidence-streams
     (map 
      (lambda (dist) 
        (get-probability dist #t))
      modelpreds))))

;;;
(define detecting-blickets
  (mem 
   (lambda 
     (evidence
      blicket-base-rate 
      blicket-power 
      non-blicket-power 
      machine-spontaneously-goes-off)

     (enumeration-query

      ; some objects are blickets
      (define blicket (mem (lambda (block) (flip blicket-base-rate))))

      ; some blocks have the power to make the box go off
      (define block-power (lambda (block) (if (blicket block) blicket-power non-blicket-power)))

      ; sometimes the machine goes off spontaneously
      ; otherwise, goes off if one of the blocks has the ability to make it go off (sequentially evaluated)

      (define machine-goes-off
        (lambda (blocks)
          (if (null? blocks)
              (flip machine-spontaneously-goes-off)
              (or (flip (block-power (first blocks)))
                  (machine-goes-off (rest blocks))))))

      (blicket 'A)

      ; all checks to make sure all are true; i.e. all the of the lists of blickets made the machine-go-off
      (all (map machine-goes-off evidence))))))


; 5 experiment conditions / stimuli
(define possible-evidence-streams
  (list 
   (list (list 'A))
   (list (list 'A 'B))
   (list (list 'A 'B) (list 'B))
   (list (list 'A 'B) (list 'A 'B))
   (list '())))


; note: always the query "is A a blicket?"
(define data
  (list 
   (list #t #t #t #t #t #t #t #t #t #t #f) 
   (list #t #t #t #t #t #t #f #f #f #f #f)
   (list #t #t #t #t #f #f #f #f #f #f #f)
   (list #t #t #t #t #t #t #t #t #f #f #f)
   (list #t #t #f #f #f #f #f #f #f #f #f)))


(define data-analysis
  (mh-query 100 10

            ; make-bins takes arguments: lower-bound, upper-bound, step
            (define blicket-base-rate (uniform-draw (make-bins 0.1 0.9 0.1)))

            (define blicket-power (uniform-draw (make-bins 0.1 0.9 0.1)))
            (define non-blicket-power (uniform-draw (make-bins 0.1 0.9 0.1)))

            (define machine-spontaneously-goes-off (uniform-draw (make-bins 0.1 0.9 0.1)))

            (define cognitive-model-predictions
              (map (lambda (evidence) 
                     (detecting-blickets evidence blicket-base-rate blicket-power 
                                         non-blicket-power machine-spontaneously-goes-off))
                   possible-evidence-streams))


            ; query statement
            (list 
             (summarize-model cognitive-model-predictions)
             blicket-base-rate
             blicket-power
             non-blicket-power
             machine-spontaneously-goes-off)

            ; factor statement (in leiu of the condition statement)
            (factor (sum (flatten (map 
                                   (lambda (data-for-one-stimulus model)
                                     ; map over data points in a given stimulus
                                     (map (lambda (single-data-point)
                                            (log (get-probability model single-data-point)))
                                          data-for-one-stimulus))
                                   data
                                   cognitive-model-predictions))))))


(define results (transpose data-analysis))

;;;fold:
(define posterior-predictive (list possible-evidence-streams 
                                   (expval-from-mh-analysis-of-enum-model (first results))))

(define posterior-blicket-br (second results))
(define posterior-blicket-pow (third results))
(define posterior-nonblicket-pow (fourth results))
(define posterior-machine (fifth results))
(define data-summary  (summarize-data (list possible-evidence-streams data)))
(define model-data (zip (second posterior-predictive) (second data-summary)))
;;;

(hist posterior-blicket-br "posterior on blicket base rate")
(hist posterior-blicket-pow "posterior on blicket power")
(hist posterior-nonblicket-pow "posterior on nonblicket power")
(hist posterior-machine "posterior on machine sponatenously going off")

(scatter model-data "data vs. cognitive model")

(barplot posterior-predictive "cognitive model: probability of blicket?")
(barplot data-summary "data: proportion of 'A is a Blicket!' responses")
~~~~

Before running this program, answer the following question:

B. What does the query statement in data-analysis return? What does the query statement in detecting-blickets return? Why are there two queries in this program?

C. Now, run the program. [Note: This will take between 15-30 seconds to run.] Interpret each of the resulting plots.

D. How do your interpretations relate to the parameter values that were set in the original program?

E. Look carefully at the priors (in the code) and the posteriors (in the plots) over blicket-power and non-blicket-power. Did we impose any a priori assumptions about the relationship between these parameters? Think about the experimental setup. Do you think we would be justified in imposing any assumptions? Why or why not? What do the posteriors tell you? How was the data analysis model able to arrive at this conclusion?

F. Do you notice anything about the scatter plot? How would you interpret this? Is there something we could add to the data analysis model to account for this?

G. Now, we’re going to examine the predictions of the model if we had done a more traditional analysis of point-estimates of parameters (i.e. fitting parameters). Examine your histograms and determine the “maximum a posteriori” (MAP) value for each parameter. Plug those into the code below and run it.

~~~~
;;;fold:
(define (get-indices needle haystack)
  (define (loop rest-of-haystack index)
    (if (null? rest-of-haystack) '()
        (let ((rest-of-indices (loop (rest rest-of-haystack) (+ index 1))))
          (if (equal? (first rest-of-haystack) needle)
              (pair index rest-of-indices)
              rest-of-indices))))
  (loop haystack 1))


(define get-probability
  (lambda (dist selection)
    (define index (list-index (first dist) selection))
    (list-ref (second dist) index)))


(define summarize-data 
  (lambda (dataset)
    (list (first dataset)
          (map 
           (lambda (lst) (mean (map boolean->number lst)))
           (second dataset)))))


(define summarize-model
  (lambda (modelpreds)
    (list 
     possible-evidence-streams
     (map 
      (lambda (dist) 
        (get-probability dist #t))
      modelpreds))))

;;;
(define detecting-blickets
  (mem 
   (lambda 
     (evidence
      blicket-base-rate 
      blicket-power 
      non-blicket-power 
      machine-spontaneously-goes-off)

     (enumeration-query

      ; some objects are blickets
      (define blicket (mem (lambda (block) (flip blicket-base-rate))))

      ; some blocks have the power to make the box go off
      (define block-power (lambda (block) (if (blicket block) blicket-power non-blicket-power)))

      ; sometimes the machine goes off spontaneously
      ; otherwise, goes off if one of the blocks has the ability to make it go off (sequentially evaluated)

      (define machine-goes-off
        (lambda (blocks)
          (if (null? blocks)
              (flip machine-spontaneously-goes-off)
              (or (flip (block-power (first blocks)))
                  (machine-goes-off (rest blocks))))))

      (blicket 'A)

      ; all checks to make sure all are true; i.e. all the of the lists of blickets made the machine-go-off
      (all (map machine-goes-off evidence))))))


; 5 experiment conditions / stimuli
(define possible-evidence-streams
  (list 
   (list (list 'A))
   (list (list 'A 'B))
   (list (list 'A 'B) (list 'B))
   (list (list 'A 'B) (list 'A 'B))
   (list '())))

(define data
  (list 
   (list #t #t #t #t #t #t #t #t #t #t #f) 
   (list #t #t #t #t #t #t #f #f #f #f #f)
   (list #t #t #t #t #f #f #f #f #f #f #f)
   (list #t #t #t #t #t #t #t #t #f #f #f)
   (list #t #t #f #f #f #f #f #f #f #f #f)))

; fill in with your "maximum a posteriori" parameter values from Part C.
(define blicket-base-rate ...)
(define blicket-power ...)
(define non-blicket-power ...)
(define machine-spontaneously-goes-off ...)

(define best-fit-model-predictions 
  (map (lambda (evidence) 
         (get-probability 
          (detecting-blickets evidence blicket-base-rate blicket-power 
                              non-blicket-power machine-spontaneously-goes-off) 
          #t))
       possible-evidence-streams))

(define data-summary  (summarize-data (list possible-evidence-streams data)))
(define model-data (zip best-fit-model-predictions (second data-summary)))
(scatter model-data "data vs. cognitive model")
(barplot (list possible-evidence-streams best-fit-model-predictions) "cognitive model: probability of blicket?")
(barplot data-summary "data: proportion of 'A is a Blicket!' responses")
~~~~

H. What can you conclude about the two ways of looking at parameters in this model’s case? Do you think the model is relatively robust to different parameter settings?