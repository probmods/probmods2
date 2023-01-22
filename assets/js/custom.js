"use strict";

// Utils

function euclideanDistance(v1, v2){
  var i;
  var d = 0;
  for (i = 0; i < v1.length; i++) {
    d += (v1[i] - v2[i])*(v1[i] - v2[i]);
  }
  return Math.sqrt(d);
};


// MCMC callbacks

var MCMC_Callbacks = {

	finalAccept: {
		finish: function(trace) {
			var ratio = (trace.info.accepted / trace.info.total);
			console.log('Acceptance ratio: ' + ratio);
		}
	}
	
};