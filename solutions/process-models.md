~~~
///fold:
var time = function(foo, trials) {
  var start = _.now()
  var ret = repeat(trials, foo)
  var end = _.now()
  return (end-start)/trials
}
///

var detectingBlickets = function(evidence, params) {
  return Infer({method: params.algorithm , samples: params.samples}, function() {
    var blicket = mem(function(block) {return flip(params.baseRate)})
    var power = function(block) {return blicket(block) ? .95 : .05}
    var machineBeeps = function(blocks) {
      return (blocks.length == 0 ? flip(0.05) :
              flip(power(first(blocks))) || machineBeeps(rest(blocks)))
    }
    condition(machineBeeps(evidence))
    return blicket('A')
  })
}

var rtOutput = function(evidence, params) {
  var meanTime = time(function() { detectingBlickets(evidence, params)}, 10)
  return Gaussian({mu: meanTime, sigma: 1})
}

var responseOutput = function(evidence, params) {
  return detectingBlickets(evidence, params)
} 

var baseratePrior = mem(function(subject) {
  return uniform(0,1)
})

var marsData = [
  {subjectID: 1, evidence: ['A'], response: true, RT: .9},
  {subjectID: 1, evidence: ['A', 'B', 'C', 'D', 'E', 'F'], response: true, RT: 1.1},
  {subjectID: 1, evidence: ['A', 'B', 'C'], response: true, RT: 1.2},
  {subjectID: 2, evidence: ['A'], response: true, RT: 3.5},
  {subjectID: 2, evidence: ['A', 'B', 'C', 'D', 'E', 'F'], response: false, RT: 4},
  {subjectID: 2, evidence: ['A', 'B', 'C'], response: true, RT: 3.4},
]

// var venusData = [
//   {subjectID: 1, evidence: ['A'], response: true, RT: .9},
//   {subjectID: 1, evidence: ['A', 'B', 'C', 'D', 'E', 'F'], response: false, RT: 4},
//   {subjectID: 1, evidence: ['A', 'B', 'C'], response: true, RT: 2},
//   {subjectID: 2, evidence: ['A'], response: true, RT: 1.5},
//   {subjectID: 2, evidence: ['A', 'B', 'C', 'D', 'E', 'F'], response: true, RT: 5},
//   {subjectID: 2, evidence: ['A', 'B', 'C'], response: true, RT: 2.2},
// ];

var dataAnalysis = function() {
  var parameters = {
    //baseRate: uniform(0, 1) // use this for part A
    algorithm: flip() ? 'rejection' : 'enumerate',
    samples: randomInteger(100) + 1
  }
  
  mapData({data: marsData}, function(dataPoint) {
    var modelParameters = extend(parameters, {baseRate: baseratePrior(dataPoint.subjectID)})
    observe(responseOutput(dataPoint.evidence, modelParameters), dataPoint.response);
    observe(rtOutput(dataPoint.evidence, modelParameters), dataPoint.RT);
  })

  return extend(parameters, {subj1 : baseratePrior(1),
                            subj2 : baseratePrior(2)})
}


var nSamples = 500

// Do not change below
var opts = {method: 'MCMC', callbacks: [editor.MCMCProgress()], 
            samples: nSamples, burn: 100}
var posterior = Infer(opts, dataAnalysis)
viz.marginals(posterior)
~~~
