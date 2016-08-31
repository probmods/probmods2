var _ = require('underscore');

var fs = require('fs');

var argv = process.argv.slice(2);

if (argv.length == 0) {
  throw new Error('give a filename as argument');
}

var delimiters = ["(", ")", "[", "]", "'", ",", "@", "\"", ";"]
var whitespace_re = /^\s/


function get_site_map(s) {
  var map = {};
  var row = 1;
  var col = 1;
  for (var i = 0; i < s.length; i++) {
	  if (s[i] == "\n") {
	    row++;
	    col = 1;
	  } else {
	    map[i] = row + ":" + col;
	    col++;
	  }
  }
  return map;
}

function tokenize(string) {
  var s = string,
      n = s.length;
  var tokens = [];
  var i = 0, j = 0;
  var site_map = get_site_map(s);
  while (i < n) {
	  if (s[i].match(whitespace_re)) {
      // skip whitespace
	    i++;
	  } else if (s[i] == ";") {
      // skip comments
	    for (; i < n && s[i] != "\n" && s[i] != "\r"; i++) {}
	  } else {
	    if (s[i] == "\"") {
		    for (j = i + 1; ; j++) {
		      if (j > n) {
			      throw new SyntaxError("Unclosed double quote");
		      } else if (s.slice(j, j + 2) == "\\\"") {
            // don't get tripped up by escaped quote
			      j++;
		      } else if (s[j] == "\"") {
			      j++;
			      break;
		      }
		    }
	    } else if (delimiters.indexOf(s[i]) != -1) {
        // current character is a delimiter
		    j = i + 1;
	    } else {
        // seek until current character is a delimiter
		    for (j = i; j < n; j++) {
		      if (delimiters.indexOf(s[j]) != -1 || s[j].match(whitespace_re)) {
			      break;
		      }
		    }
	    }
	    var token = s.slice(i, j);
	    if (token[0] == '"') {
		    token = '"' + token.substring(1, token.length-1).replace(/\\\"/g, '"') + '"'
      }
	    tokens.push(token);
	    i = j;
	  }
  }
  return tokens;
}


var code = fs.readFileSync(argv[0], 'utf8');

var tokens = tokenize(code);

// var desugarSingleQuotes = function(_tokens) {
//   var tokens = _.clone(_tokens)
//   var hits = _.where(tokens, '\'');
//   var n = tokens.length;

//   _.each(hits,
//          function(i) {
//            if (i == n - 1) {
//              throw new Error('dsgr single quote: single quote at end of file')
//            }
//            // '(a b c d) => (quote a b c)
//            if (_.isArray(tokens[i + 1])) {
//              tokens.splice(i, 2,

//                           )
//            }
//          })
// }

// TODO: explain why this works
var sexpify = function(tokens) {
  var stack = [];
  var result = [];
  var quoting = false,
      quoteParenCount = 0;

  // just handle single quotes (i.e., symbols and short hand lists) in-line here
  // because we don't actually use quasiquote, unquote, or unquote-splicing in
  // the textbook
  var currentList;
  _.each(tokens,
         function(token, i) {
           currentList = _.last(stack) || [];

           if (token == '(') {
             // make a new array
             var newList = [];
             if (quoting) {
               newList.push('quote');
               quoting = false;
             }
             stack.push(newList);
             //currentList.push(newList);
           } else if (token == ')') {
             var toPush = stack.pop();
             (_.last(stack) || result).push( toPush )
           } else if (token == '\'') {
             quoting = true;
           } else {
             currentList.push(quoting ? '"' + token + '"' : token);
             quoting = false;
           }

           // debugging:
           // console.log(token)
           // console.log(stack)
           // console.log(result)
           // console.log('    ')
         }
        )

    return result;

}

var sexps = sexpify(tokens);
//console.log(JSON.stringify(sexps,null,1));
//console.log(sexps);
//process.exit()


var rules = [];
var addRule = function(name, trigger, replacer) {
  rules.push({name: name, trigger: trigger, replacer: replacer})
}

addRule('int',
        function(s) { return _.isString(s) && !_.isNaN(parseInt(s)) },
        function(s) { return parseInt(s) })

addRule('symbol',
        function(s) { return _.isString(s) && s[0] == '"' && s[s.length - 1] == '"' },
        function(s) { return s })

addRule('string',
        function(s) { return _.isString(s) && s[0] == '"' && s[s.length - 1] == '"' },
        function(s) { return s })

addRule('list-shorthand',
        function(s) { return _.isArray(s) && s[0] == 'quote' },
        function(s) { return '[' + s.slice(1).map(compile).join(', ') + ']'})


// (define a b) --> var a = b;
addRule('var',
        function(s) { return s.length == 3 && s[0] == 'define' && !_.isArray(s[1]) },
        function(s) { return 'var ' + s[1] + ' = ' + compile(s[2]) + ';'; })

// (if a else b)
// addRule('if',
//         function(s) { return s.length == 3 && s[0] == 'define' && !_.isArray(s[1]) },
//         function(s) { return 'var ' + s[1] + ' = ' + compile(s[2]) + ';'; })

// mh-query

// rejection-query

// enumeration-query


//console.log(rules)

var compile = function(s) {
  // top level program: map over sexps and compile each


  for(var i = 0, ii = rules.length; i < ii; i++) {
    var rule = rules[i];
    var name = rule.name,
        trigger = rule.trigger,
        replacer = rule.replacer;
    if (trigger(s)) {
      return replacer(s)
    }
  }

  throw new Error('unmatched sexp ' + JSON.stringify(s, null, 1))
}

console.log(compile(['define','a','"foo"']))
console.log(compile([ 'define', 'foo', [ 'quote', '1', '2', '3' ] ]))
