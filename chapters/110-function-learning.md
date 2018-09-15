---
layout: chapter
title: Learning continuous functions
description: Continuous functions and deep probabilistic models
chapter_num: 11
---

Recall curve fitting with polynomials:

~~~~
// a0 + a1*x + a2*x^2 + ...
var makePoly = function(as) {
  return function(x) {
    return sum(mapIndexed(function(i,a) { return a * Math.pow(x, i) }, as))
  }
}

var observedData = [{"x":-4,"y":69.76636938284166},{"x":-3,"y":36.63586217969598},{"x":-2,"y":19.95244368751754},{"x":-1,"y":4.819485497724985},{"x":0,"y":4.027631414787425},{"x":1,"y":3.755022418210824},{"x":2,"y":6.557548104903805},{"x":3,"y":23.922485493795072},{"x":4,"y":50.69924692420815}]

var inferOptions = {method: 'optimize', samples: 100, steps: 2000, optMethod: {adam: {stepSize: .01}}}

var post = Infer(inferOptions,
  function() {
    var coeffs = repeat(4, function() {return gaussian(0,2)})
    var order = discrete([0.25,0.25,0.25,0.25])
    var f = makePoly(coeffs.slice(0,order+1))

    var obsFn = function(datum){
      observe(Gaussian({mu: f(datum.x), sigma: 30}), datum.y)
    }
    mapData({data: observedData}, obsFn)

    return {order: order,
            coeffs: coeffs}
  }
)

print("observed data:")
viz.scatter(observedData)

// viz.marginals(post)

var xs = [-4,-3,-2,-1,0,1,2,3,4]
var postFnSample = function(){
  var p = sample(post)
  return makePoly(p.coeffs.slice(0,p.order+1))
}
viz.line(xs, map(postFnSample(), xs))
viz.line(xs, map(postFnSample(), xs))
viz.line(xs, map(postFnSample(), xs))
~~~~

Now let's make the function a neural net:

~~~~
var dm = 10 //try changing this!

var makeFn = function(M1,M2,B1){
  return function(x){
    return T.toScalars(
      // M2 * sigm(x * M1 + B1):
      T.dot(M2,T.sigmoid(T.add(T.mul(M1,x),B1)))
    )[0]}
}

var observedData = [{"x":-4,"y":69.76636938284166},{"x":-3,"y":36.63586217969598},{"x":-2,"y":19.95244368751754},{"x":-1,"y":4.819485497724985},{"x":0,"y":4.027631414787425},{"x":1,"y":3.755022418210824},{"x":2,"y":6.557548104903805},{"x":3,"y":23.922485493795072},{"x":4,"y":50.69924692420815}]

var inferOptions = {method: 'optimize', samples: 100, steps: 2000, optMethod: {adam: {stepSize: .01}}}

var post = Infer(inferOptions,
  function() {  
    var M1 = sample(DiagCovGaussian({mu: zeros([dm, 1]), sigma: ones([dm,1])}))
    var B1 = sample(DiagCovGaussian({mu: zeros([dm, 1]), sigma: ones([dm,1])}))
    var M2 = sample(DiagCovGaussian({mu: zeros([1, dm]), sigma: ones([1,dm])}))
    
    var f = makeFn(M1,M2,B1)
    
    var obsFn = function(datum){
      observe(Gaussian({mu: f(datum.x), sigma: 2}), datum.y)
    }
    mapData({data: observedData}, obsFn)

    return {M1: M1, M2: M2, B1: B1}
  }
)

print("observed data:")
viz.scatter(observedData)

var xs = [-4,-3,-2,-1,0,1,2,3,4]
var postFnSample = function(){
  var p = sample(post)
  return makeFn(p.M1,p.M2,p.B1) 
}
viz.line(xs, map(postFnSample(), xs))
viz.line(xs, map(postFnSample(), xs))
viz.line(xs, map(postFnSample(), xs))
~~~~

If we don't care much about the uncertainty in which function we learn, we can do MLE inference:

~~~~
var dm = 100

var makeFn = function(M1,M2,B1){
  return function(x){return T.toScalars(T.dot(M2,T.sigmoid(T.add(T.mul(M1,x),B1))))[0]}
}

var observedData = [{"x":-4,"y":69.76636938284166},{"x":-3,"y":36.63586217969598},{"x":-2,"y":19.95244368751754},{"x":-1,"y":4.819485497724985},{"x":0,"y":4.027631414787425},{"x":1,"y":3.755022418210824},{"x":2,"y":6.557548104903805},{"x":3,"y":23.922485493795072},{"x":4,"y":50.69924692420815}]

var inferOptions = {method: 'optimize', samples: 100, steps: 2000, optMethod: {adam: {stepSize: .01}}}

var post = Infer(inferOptions,
  function() {  
    var M1 = sample(DiagCovGaussian({mu: zeros([dm, 1]), sigma: ones([dm,1])}), {
      guide: function() {return Delta({v: param({dims: [dm, 1]})})}})
    var B1 = sample(DiagCovGaussian({mu: zeros([dm, 1]), sigma: ones([dm,1])}), {
      guide: function() {return Delta({v: param({dims: [dm, 1]})})}})
    var M2 = sample(DiagCovGaussian({mu: zeros([1, dm]), sigma: ones([1,dm])}), {
      guide: function() {return Delta({v: param({dims: [1, dm]})})}})
    
    var f = makeFn(M1,M2,B1)
    
    var obsFn = function(datum){
      observe(Gaussian({mu: f(datum.x), sigma: 2}), datum.y)
    }
    mapData({data: observedData}, obsFn)

    return {M1: M1, M2: M2, B1: B1}
  }
)

print("observed data:")
viz.scatter(observedData)

var xs = [-4,-3,-2,-1,0,1,2,3,4]
var postFnSample = function(){
  var p = sample(post)
  return makeFn(p.M1,p.M2,p.B1) 
}
viz.line(xs, map(postFnSample(), xs))
viz.line(xs, map(postFnSample(), xs))
viz.line(xs, map(postFnSample(), xs))
~~~~

Having shown that we can stick an unknown function in our supervised model, we can stick one anywhere in a generative model!

Here we learn an unsupervised model of x,y pairs, which are generated from a latent z passed through a (learned) function.

~~~~
var hd = 50
var ld = 10
var outSig = Vector([0.1, 0.1])

var makeFn = function(M1,M2,B1){
  return function(x){return T.dot(M2,T.sigmoid(T.add(T.dot(M1,x),B1)))}
}

var observedData = [{"x":-4,"y":69.76636938284166},{"x":-3,"y":36.63586217969598},{"x":-2,"y":19.95244368751754},{"x":-1,"y":4.819485497724985},{"x":0,"y":4.027631414787425},{"x":1,"y":3.755022418210824},{"x":2,"y":6.557548104903805},{"x":3,"y":23.922485493795072},{"x":4,"y":50.69924692420815}]

var inferOptions = {method: 'optimize', samples: 100, steps: 5000, optMethod: {adam: {stepSize: .01}}}

var post = Infer(inferOptions,
  function() {  
    var M1 = sample(DiagCovGaussian({mu: zeros([hd,ld]), sigma: ones([hd,ld])}), {
      guide: function() {return Delta({v: param({dims: [hd, ld]})})}})
    var B1 = sample(DiagCovGaussian({mu: zeros([hd, 1]), sigma: ones([hd,1])}), {
      guide: function() {return Delta({v: param({dims: [hd, 1]})})}})
    var M2 = sample(DiagCovGaussian({mu: zeros([2,hd]), sigma: ones([2,hd])}), {
      guide: function() {return Delta({v: param({dims: [2,hd]})})}})
    
    var f = makeFn(M1,M2,B1)
    
    var obsFn = function(datum){
      var z = sample(DiagCovGaussian({mu: zeros([ld, 1]), sigma: ones([ld,1])}))
//       print(datum)
//       print(T.toScalars(z))
//       print(T.toScalars(f(z)))
//       print(" ")
      observe(DiagCovGaussian({mu: f(z), sigma: outSig}), Vector([datum.x, datum.y]))
    }
    mapData({data: observedData}, obsFn)

    return {M1: M1, M2: M2, B1: B1}
  }
)

print("observed data:")
viz.scatter(observedData)

var postSample = function(){
  var p = sample(post)
  var f = makeFn(p.M1,p.M2,p.B1)
  var z = sample(DiagCovGaussian({mu: zeros([ld, 1]), sigma: ones([ld,1])}))
  var s = T.toScalars(f(z))
  return {x:s[0], y:s[1]}
}

viz.scatter(repeat(10, postSample))
~~~~

Reading & Discussion: [Readings]({{site.baseurl}}/readings/110-function-learning.html)

Test your knowledge: [Exercises]({{site.baseurl}}/exercises/110-function-learning.html)

Next chapter: [Hierarchical models]({{site.baseurl}}/chapters/120-hierarchical-models.html)
