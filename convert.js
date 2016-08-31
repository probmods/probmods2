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

var sexpify = function(tokens) {
  var stack = [];
  var result = [];

  var currentList;
  _.each(tokens,
         function(token) {
           currentList = _.last(stack) || [];

           if (token == '(') {
             // make a new array
             var newList = [];
             stack.push(newList);
             //currentList.push(newList);
           } else if (token == ')') {
             var toPush = stack.pop();
             (_.last(stack) || result).push( toPush )
           } else {
             currentList.push(token)
           }

           // console.log(token)
           // console.log(stack)
           // console.log(result)
           // console.log('    ')
         }
        )

    return result;

}

var sexps = sexpify(tokens);

console.log(JSON.stringify(sexps,null,1));
