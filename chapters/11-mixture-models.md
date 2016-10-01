---
layout: chapter
title: Mixture models
description: Something clever
---

In the chapter on [Hierarchical Models]({{site.baseurl}}/chapters/09-hierarchical-models.html), we saw the power of probabilistic inference in learning about the latent structure underlying different kinds of observations: the mixture of colors in different bags of marbles, or the prototypical features of categWebPPLories of animals. In that discussion we always assumed that we knew what kind each observation belonged to---the bag that each marble came from, or the subordinate, basic, and superordinate category of each object. Knowing this allowed us to pool the information from each observation for the appropriate latent variables. What if we don't know *a priori* how to divide up our observations? In this chapter we explore the problem of simultaneously discovering kinds and their properties -- this can be done using *mixture models*.

# Learning Categories
Imagine a child who enters the world and begins to see objects. She can't begin by learning the typical features of cats or mice, because she doesn't yet know that there are such kinds of objects as cats and mice. Yet she may quickly notice that some of the objects all tend to purr and have claws, while other objects are small and run fast---she can
 *cluster* the objects together on the basis of common features and thus form categories (such as cats and mice), whose typical features she can then learn.

To formalize this learning problem, we begin by adapting the bags-of-marbles examples from the [Hierarchical Models]({{site.baseurl}}/chapters/09-hierarchical-models.html) chapter. However, we now assume that the bag that each marble is drawn from is *unobserved* and must be inferred.

~~~~
///fold:
var getProbs = function(vector) {
  return map(function(i) {return T.get(vector,i)}, _.range(vector.length))
}

var observeBag = function(bag, values) {
  return sum(map(function(v) {return bag.score(v)}, values));
}
///
var colors = ['blue', 'green', 'red'];

var predictives = Infer({method: 'MCMC', samples: 30000}, function(){
  var phi = dirichlet(ones([3, 1]))
  var alpha = 0.1
  var prototype = T.mul(phi, alpha)
  
  var makeBag = mem(function(bag){
    return Categorical({vs: colors, ps: getProbs(dirichlet(prototype))});
  })
  
  // each observation (which is named for convenience) comes from one of three bags:
  var obsToBag = mem(function(obsName) {
    return uniformDraw(['bag1', 'bag2', 'bag3'])
  });
  
  factor(observeBag(makeBag(obsToBag('obs1')), ['red']) +
         observeBag(makeBag(obsToBag('obs2')), ['red']) +
         observeBag(makeBag(obsToBag('obs3')), ['blue']) +
         observeBag(makeBag(obsToBag('obs4')), ['blue']) +
         observeBag(makeBag(obsToBag('obs5')), ['red']) +
         observeBag(makeBag(obsToBag('obs6')), ['blue']))

  return {sameBag12: obsToBag('obs1') == obsToBag('obs2'),
          sameBag13: obsToBag('obs1') == obsToBag('obs3')}
});

viz.marginals(predictives);
~~~~

We see that it is likely that `obs1` and `obs2` came from the same bag, but quite unlikely that `obs3` did. Why? Notice that we have set `alpha` small, indicating a belief that the marbles in a bag will tend to all be the same color. How do the results change if you make `alpha` larger? Why?  Note that we have queried on whether observed marbles came out of the same bag, instead of directly querying on the bag number that an observation came from. This is because the bag number by itself is meaningless---it is only useful in its role of determining which objects have similar properties. Formally, the model we have defined above is symmetric in the bag labels (if you permute all the labels you get a new state with the same probability).

Instead of assuming that a marble is equally likely to come from each bag, we could instead learn a distribution over bags where each bag has a different probability. This is called a *mixture distribution* over the bags:

~~~~
///fold:
var getProbs = function(vector) {
  return map(function(i) {return T.get(vector,i)}, _.range(vector.length))
}

var observeBag = function(bag, values) {
  return sum(map(function(v) {return bag.score(v)}, values));
}
///
var colors = ['blue', 'green', 'red'];

var predictives = Infer({method: 'MCMC', samples: 30000}, function(){
  var phi = dirichlet(ones([3, 1]))
  var alpha = 0.1
  var prototype = T.mul(phi, alpha)
  
  var makeBag = mem(function(bag){
    return Categorical({vs: colors, ps: getProbs(dirichlet(prototype))});
  })
  
  // the probability that an observation will come from each bag:
  var bagMixture = dirichlet(ones([3, 1]))
  var obsToBag = mem(function(obsName) {
    return categorical({vs: ['bag1', 'bag2', 'bag3'], ps: getProbs(bagMixture)});
  });
  
  factor(observeBag(makeBag(obsToBag('obs1')), ['red']) +
         observeBag(makeBag(obsToBag('obs2')), ['red']) +
         observeBag(makeBag(obsToBag('obs3')), ['blue']) +
         observeBag(makeBag(obsToBag('obs4')), ['blue']) +
         observeBag(makeBag(obsToBag('obs5')), ['red']) +
         observeBag(makeBag(obsToBag('obs6')), ['blue']))

  return {sameBag12: obsToBag('obs1') == obsToBag('obs2'),
          sameBag13: obsToBag('obs1') == obsToBag('obs3')}
});

viz.marginals(predictives);
~~~~

Models of this kind are called **mixture models** because the observations are a "mixture" of several categories. Mixture models are widely used in modern probabilistic modeling because they describe how to learn the unobservable categories which underlie observable properties in the world.

The observation distribution associated with each mixture *component* (i.e., kind or category) can be any distribution we like. For example, here is a mixture model with *Gaussian* components:

~~~~
///fold:
var getProbs = function(vector) {
  return map(function(i) {return T.get(vector,i)}, _.range(vector.length))
}

var observePoint = function(cat, obs) {
  return (Gaussian({mu: cat.xMean, sigma: 0.01}).score(obs.x) +
          Gaussian({mu: cat.yMean, sigma: 0.01}).score(obs.y));
};                                         
///

var predictives = Infer({method: 'MCMC', samples: 200, lag: 100}, function(){ 
  // the probability that an observation will come from each bag:
  var catMixture = dirichlet(ones([2, 1]))
  
  var obsToCat = mem(function(obsName) {
    return categorical({vs: ['cat1', 'cat2'], ps: getProbs(catMixture)});
  });
  var catToMean = mem(function(cat) {
    return {xMean: gaussian(0,1), yMean: gaussian(0,1)};
  })
  
  // one cluster of points in the top right quadrant
  factor(observePoint(catToMean(obsToCat('a1')), {x: 0.50, y: 0.50}) +
         observePoint(catToMean(obsToCat('a2')), {x: 0.60, y: 0.50}) +
         observePoint(catToMean(obsToCat('a3')), {x: 0.50, y: 0.40}) +
         observePoint(catToMean(obsToCat('a4')), {x: 0.55, y: 0.55}) +
         observePoint(catToMean(obsToCat('a5')), {x: 0.45, y: 0.45}) +
         observePoint(catToMean(obsToCat('a6')), {x: 0.50, y: 0.50}) +
         observePoint(catToMean(obsToCat('a7')), {x: 0.70, y: 0.60}))

  // another cluster of points in the lower left quadrant
  factor(observePoint(catToMean(obsToCat('b1')), {x: -0.50, y: -0.50}) +
         observePoint(catToMean(obsToCat('b2')), {x: -0.70, y: -0.40}) +
         observePoint(catToMean(obsToCat('b3')), {x: -0.50, y: -0.60}) +
         observePoint(catToMean(obsToCat('b4')), {x: -0.55, y: -0.55}) +
         observePoint(catToMean(obsToCat('b5')), {x: -0.50, y: -0.45}) +
         observePoint(catToMean(obsToCat('b6')), {x: -0.60, y: -0.50}) +
         observePoint(catToMean(obsToCat('b7')), {x: -0.60, y: -0.40}))

  return {cat1: catToMean('cat1'),
          cat2: catToMean('cat2')}
});

viz.marginals(predictives);
~~~~

## Example: Topic Models

One very popular class of mixture-based approaches are *topic models*,
which are used for document classification, clustering, and
retrieval. The simplest kind of topic models make the assumption that
documents can be represented as *bags of words* &mdash; unordered
collections of the words that the document contains. In topic models,
each document is associated with a mixture over *topics*, each of
which is itself a distribution over words.

One popular kind of bag-of-words topic model is known as *Latent Dirichlet Allocation*
(LDA, @Blei2003). The
generative process for this model can be described as follows. For
each document, mixture weights over a set of $$K$$ topics are
drawn from a Dirichlet prior. Then $$N$$ topics are sampled
for the document&mdash;one for each word. Each topic itself is
associated with a distribution over words, and this distribution is
drawn from a Dirichlet prior. For each of the $$N$$ topics
drawn for the document, a word is sampled from the corresponding
multinomial distribution. This is shown in the WebPPL code below.

**TODO: I adapted this from the webppl examples folder; might want to re-factor (e.g. with mem) to look more like previous examples**

~~~~
var getProbs = function(vector) {
  return map(function(i) {return T.get(vector,i)}, _.range(vector.length))
}

var vocabulary = ['DNA', 'evolution', 'parsing', 'phonology'];
var topics = {
  'topic1': null,
  'topic2': null
};

var docs = {
  'doc1': 'DNA evolution DNA evolution DNA evolution DNA evolution DNA evolution'.split(' '),
  'doc2': 'DNA evolution DNA evolution DNA evolution DNA evolution DNA evolution'.split(' '),
  'doc3': 'DNA evolution DNA evolution DNA evolution DNA evolution DNA evolution'.split(' '),
  'doc4': 'parsing phonology parsing phonology parsing phonology parsing phonology parsing phonology'.split(' '),
  'doc5': 'parsing phonology parsing phonology parsing phonology parsing phonology parsing phonology'.split(' '),
  'doc6': 'parsing phonology parsing phonology parsing phonology parsing phonology parsing phonology'.split(' ')
};

var makeWordDist = function() {
  return dirichlet(ones([vocabulary.length, 1]));
};

var makeTopicDist = function() {
  return dirichlet(ones([_.size(topics), 1]));
};

var discreteFactor = function(vs, ps, v) {
  var i = vs.indexOf(v);
  factor(Math.log(T.get(ps, i)));
}

var model = function() {

  var wordDistForTopic = mapObject(makeWordDist, topics);
  var topicDistForDoc = mapObject(makeTopicDist, docs);
  var makeTopicForWord = function(docName, word) {
    var i = discrete(topicDistForDoc[docName]);
    return _.keys(topics)[i];
  };
  var makeWordTopics = function(docName, words) {
    return map(function(word) {return makeTopicForWord(docName, word);},
               words);
  };
  var topicsForDoc = mapObject(makeWordTopics, docs);

  mapObject(
      function(docName, words) {
        map2(
            function(topic, word) {
              discreteFactor(vocabulary, wordDistForTopic[topic], word);
            },
            topicsForDoc[docName],
            words);
      },
      docs);

  return {topic1: _.object(vocabulary, getProbs(wordDistForTopic.topic1)),
          topic2: _.object(vocabulary, getProbs(wordDistForTopic.topic2))}
};

var results = Infer({method: 'MCMC', samples: 20000}, model);
viz.bar(vocabulary, map(function(word) {return expectation(results, function(v) {return v['topic1'][word]})}, vocabulary))
viz.bar(vocabulary, map(function(word) {return expectation(results, function(v) {return v['topic2'][word]})}, vocabulary))
~~~~

In this simple example, there are two topics `topic1` and
`topic2`, and four words. These words are deliberately chosen
to represent one of two possible subjects that a document can be
about: One can be thought of as 'biology' (i.e., `DNA` and
`evolution`), and the other can be thought of as 'linguistics'
(i.e., `parsing` and `syntax`).

The documents consist of lists of individual words from one or the
other topic. Based on the coocurrence of words within individual
documents, the model is able to learn that one of the topics should
put high probability on the biological words and the other topic
should put high probability on the linguistic words. It is able to
learn this because different kinds of documents represent stable
mixture of different kinds of topics which in turn represent stable
distributions over words.

## Example: Categorical Perception of Speech Sounds

<!--
### Learning of Phone Categories by Infants


(Adapted from: Maye, J., Werker, J. F., and Gerken, L. (2002). Infant sensitivity to distributional information can affect phonetic discrimination. Cognition, 82:B101–B111.)

<img src='Maye.png' />

~~~~ {data-engine="mit-church"}
(define (noisy=? x y) (and (flip (expt 0.1 (abs (- (first x) (first y)))))
                           (flip (expt 0.1 (abs (- (rest x) (rest y)))))))
(define samples
 (mh-query
   200 100

   (define bag-mixture (dirichlet '(1 1 1)))

   (define obs->cat
     (mem (lambda (obs-name)
            (multinomial '(bag1 bag2 bag3) bag-mixture))))

   (define cat->mean (mem (lambda (cat) (list (gaussian 0.0 1.0) (gaussian 0.0 1.0)))))

   (define observe
     (mem (lambda (obs-name)
            (pair (gaussian (first (cat->mean (obs->cat obs-name))) 0.01)
                  (gaussian (second (cat->mean (obs->cat obs-name))) 0.01)))))

   ;;sample a new observations and its category
   (list (obs->cat 't) (observe 't))

   (no-proposals
   (and
    (noisy=? '(0.5 . 0.5) (observe 'a1))
    (noisy=? '(0.6 . 0.5) (observe 'a2))
    (noisy=? '(0.5 . 0.4) (observe 'a3))
    (noisy=? '(0.55 . 0.55) (observe 'a4))
    (noisy=? '(0.45 . 0.45) (observe 'a5))
    (noisy=? '(0.5 . 0.5) (observe 'a6))
    (noisy=? '(0.7 . 0.6) (observe 'a7))


    (noisy=? '(-0.5 . -0.5) (observe 'b1))
    (noisy=? '(-0.7 . -0.4) (observe 'b2))
    (noisy=? '(-0.5 . -0.6) (observe 'b3))
    (noisy=? '(-0.55 . -0.55) (observe 'b4))
    (noisy=? '(-0.5 . -0.45) (observe 'b5))
    (noisy=? '(-0.6 . -0.5) (observe 'b6))
    (noisy=? '(-0.6 . -0.4) (observe 'b7))
    ))))

(scatter (map second samples) "predictive")
'done
~~~~
-->


This example is adapted from @Feldman2009.

Human perception is often skewed by our expectations. A common example of this is called *categorical perception* -- when we perceive objects as being more similar to the category prototype than they really are. In phonology this is been particularly important and is called the perceptual magnet effect: Hearers regularize a speech sound into the category that they think it corresponds to. Of course this category isn't known a priori, so a hearer must be doing a simultaneous inference of what category the speech sound corresponded to, and what the sound must have been. In the below code we model this as a mixture model over the latent categories of sounds, combined with a noisy observation process.

**This outputs the same thing at the Church, but I feel like the exposition could be better? The labels could be clearer.**

~~~~
var prototype1 = 8;
var prototype2 = 10;

var computePairDistance = function(stim1, stim2) {
  return expectation(Infer({method: 'MCMC', samples: 10000}, function() {
    var vowel1 = Gaussian({mu: prototype1, sigma: .5});
    var vowel2 = Gaussian({mu: prototype2, sigma: .5});
    
    var noiseProcess = function(target) {return Gaussian({mu: target, sigma: .2})};
    
    var target1 = flip() ? sample(vowel1) : sample(vowel2);
    var target2 = flip() ? sample(vowel1) : sample(vowel2);
    
    var obs1 = noiseProcess(target1);
    var obs2 = noiseProcess(target2);

    // Condition on the targets being equal to the stimuli through a gaussian noise process
    factor(obs1.score(stim1) + obs2.score(stim2));
    
    return Math.abs(target1 - target2);
  }))
}

var computePerceptualPairs = function(l) {
  if (l.length < 2) {
    return [];
  } else {
    return [computePairDistance(first(l), second(l))].concat(computePerceptualPairs(rest(l)));
  }
};

var computeStimulusPairs = function(l) {
  if(l.length < 2) {
    return [];
  } else {
    return [Math.abs(first(l) - second(l))].concat(computeStimulusPairs(rest(l)))
  }
}
var stimuli = _.range(prototype1, prototype2, 0.1);
var stimulusDistances = computeStimulusPairs(stimuli);
var perceptualDistances = computePerceptualPairs(stimuli);

viz.scatter(_.range(stimulusDistances.length), stimulusDistances)
viz.scatter(_.range(perceptualDistances.length), perceptualDistances)
~~~~

Notice that the perceived distances between input sounds are skewed relative to the actual acoustic distances – that is they are attracted towards the category centers.

<img src='{{site.baseurl}}/assets/img/Pme.png' />

# Unknown Numbers of Categories

The models above describe how a learner can simultaneously learn which category each object belongs to, the typical properties of objects in that category, and even global parameters about kinds of objects in general. However, it suffers from a serious flaw: the number of categories was fixed. This is as if a learner, after finding out there are cats, dogs, and mice, must force an elephant into one of these categories, for want of more categories to work with.

The simplest way to address this problem, which we call *unbounded* models, is to simply place uncertainty on the number of categories in the form of a hierarchical prior. Let's warm up with a simple example of this: inferring whether one or two coins were responsible for a set of outcomes (i.e. imagine a friend is shouting each outcome from the next room--"heads, heads, tails..."--is she using a fair coin, or two biased coins?).

**TODO: this returns a different posterior from old prob mods, but I think this is the right one... Seems to result from using `MCMC` over `condition` statements instead of using `factor` or `SMC`**

~~~~
var actualObs = [true, true, true, true, false, false, false, false];

var results = Infer({method: 'SMC', particles: 10000}, function(){
  var coins = flip() ? ['c1'] : ['c1', 'c2'];
  var coinToWeight = mem(function(c) {return uniform(0,1)});
  //   map(function(v) {condition(v == flip(coinToWeight(uniformDraw(coins))))}, actualObs)
  factor(sum(map(function(v) {
    var weight = coinToWeight(uniformDraw(coins));
    return Bernoulli({p: weight}).score(v)
  }, actualObs)));
  return {numCoins: coins.length, weight1: coinToWeight('c1'), weight2: coinToWeight('c2')};
})

viz.marginals(results);
~~~~
How does the inferred number of coins change as the amount of data grows? Why?

We could extend this model by allowing it to infer that there are more than two coins. However, no evidence requires us to posit three or more coins (we can always explain the data as "a heads coin and a tails coin"). Instead, let us apply the same idea to the marbles examples above:

~~~~
///fold:
var getProbs = function(vector) {
  return map(function(i) {return T.get(vector,i)}, _.range(vector.length))
}
///
var colors = ['blue', 'green', 'red']
var observedMarbles = ['red', 'red', 'blue', 'blue', 'red', 'blue']
var results = Infer({method: 'SMC', particles: 10000}, function() {
  var phi = dirichlet(ones([3,1]));
  var alpha = 0.1;
  var prototype = T.mul(phi, alpha);

  var makeBag = mem(function(bag){
    return Categorical({vs: colors, ps: getProbs(dirichlet(prototype))});
  })
  
  // unknown number of categories (created with placeholder names):
  var numBags = (1 + poisson(1));
  var bags = map(function(i) {return 'bag' + i;}, _.range(numBags))
  
  factor(sum(map(function(v) {return makeBag(uniformDraw(bags)).score(v)}, observedMarbles)))
  
  return numBags;
})

viz.auto(results)
~~~~
Vary the amount of evidence and see how the inferred number of bags changes.

For the prior on `numBags` we used the [*Poisson distribution*](http://en.wikipedia.org/wiki/Poisson_distribution) which is a distribution on  non-negative integers. It is convenient, though implies strong prior knowledge (perhaps too strong for this example). 

**Note: I took out the `gensym` stuff**

Unbounded models give a straightforward way to represent uncertainty over the number of categories in the world. However, inference in these models often presents difficulties. In the next section we describe another method for allowing an unknown number of things: In an unbounded model, there are a finite number of categories whose number is drawn from an unbounded prior distribution, such as the Poisson prior that we just examined. In an 'infinite model' we construct distributions assuming a truly infinite numbers of objects.

<!-- Test your knowledge: [Exercises]({{site.baseurl}}/exercises/11-mixture-models.html)  -->

Next chapter: [Non-parametric models]({{site.baseurl}}/chapters/12-non-parametric-models.html)
