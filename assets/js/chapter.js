//custom code for probmods.org

"use strict";

var renderMath = function() {
  // HT https://xuc.me/blog/KaTeX-and-Jekyll/
  $("script[type='math/tex']").replaceWith(
    function(){
      var tex = $(this).text();

      var rendered;
      try {
        rendered = katex.renderToString(tex);
      } catch (e){
        rendered = tex;
      } finally {
        return "<span class=\"inline-equation\">" + rendered + "</span>";
      }
    });

  $("script[type='math/tex; mode=display']").replaceWith(
    function(){
      var tex = $(this).text();
      var rendered;
      try {
        rendered = katex.renderToString(tex, {displayMode: true});
      } catch (e){
        console.log(e);
        rendered = tex;
      } finally {
        return "<div class=\"equation\">" + rendered + "</div>";
      }
    });
}

$(renderMath);

// Code boxes
function setupCodeBoxes(){
  // TODO: optimize this, (maybe have wpEditor.setup take a content option?)
  $('pre > code:not(.language-norun)').map(function(i,el) {
    var firstLine = $(el).text().split("\n")[0];
    var language = (firstLine == '// language: javascript' ? 'javascript' : 'webppl');

    var preEl = $(el).parent()[0];
    wpEditor.setup(preEl, {language: language})
  })
}

$(setupCodeBoxes);

if (typeof Distribution !== 'undefined') {
  Distribution.prototype.__print__ = viz.print;
}

// References and bibliography

var textohtml_map = {
  "\\\"u": "&uuml;",
  "\\\"a": "&auml;",
  "\\\"o": "&ouml;",
  "\\'e": "&eacute;",
  "\\'a": "&aacute;",
  "\\\"U": "&Uuml;",
  "\\\"A": "&Auml;",
  "\\\"O": "&Ouml;",
  "\\'E": "&Eacute;",
  "\\'A": "&Aacute;",
  "\\\"{u}": "&uuml;",
  "\\\"{a}": "&auml;",
  "\\\"{o}": "&ouml;",
  "\\'{e}": "&eacute;",
  "\\'{a}": "&aacute;",
  "\\\"{U}": "&Uuml;",
  "\\\"{A}": "&Auml;",
  "\\\"{O}": "&Ouml;",
  "\\'{E}": "&Eacute;",
  "\\'{A}": "&Aacute;"
};

function textohtml(tex) {
    for (var key in textohtml_map) {
        if (textohtml_map.hasOwnProperty(key)) {
            tex = tex.replace("{" + key + "}", textohtml_map[key]);
            tex = tex.replace(key, textohtml_map[key]);
        };
    };
    return tex;
}

function replace_html(rx, target) {
  var matches = $('p').filter(function() {
    return rx.test($(this).text())
  })

  $.each(matches,
         function() {
           var html = $(this).html();
           $(this).html(html.replace(rx, target))
         });

}

// function format_citation(citation) {
//     var s = "";
//     if (citation["URL"]) {
//         s += "<a href='" + citation["URL"] + "'>" + citation["TITLE"] + "</a>. ";
//     } else {
//         s += citation["TITLE"] + ". ";
//     };
//     s += citation["AUTHOR"] + " (" + citation["YEAR"] + ").";
//     if (citation["JOURNAL"]) {
//         s += " <em>" + citation["JOURNAL"] + "</em>.";
//     }
//     return textohtml(s);
// }

function author_lastname(authorString) {
  var names = authorString.split(", ");
  if (names.length == 0) {
    console.error('Expected first and last name, got: ' + authorString);
    return;
  }
  return names[0];
}

function short_authors(authorsString) {
  if (!authorsString) {
    console.warn('short_authors got:' + authorsString);
    return;
  }
  var authors = authorsString.split(" and ");
  if (authors.length === 0) {
    console.error('Expected >= 1 author, got: ' + authorsString);
    return authorsString;
  }
  var firstAuthor = authors[0];
  if (authors.length === 1) {
    return author_lastname(firstAuthor);
  } else if (authors.length === 2) {
    var secondAuthor = authors[1];
    return author_lastname(firstAuthor) + ' and ' + author_lastname(secondAuthor);
  } else {
    return author_lastname(firstAuthor) + ' et al.';
  }
}

function cite_url(citation) {
  if (citation["URL"]) {
    return citation["URL"];
  }
  return 'https://scholar.google.com/scholar?q="' + escape(citation["TITLE"]) + '"';
}

function format_reft(citation) {
  var s = "";
  s += "<a class='ref' href='" + cite_url(citation) + "'>";
  s += short_authors(citation["AUTHOR"]) + " (" + citation["YEAR"] + ")";
  s += "</a>";
  return textohtml(s);
}

function format_refp(citation) {
  var s = "(";
  s += "<a class='ref' href='" + cite_url(citation) + "'>";
  s += short_authors(citation["AUTHOR"]) + ", " + citation["YEAR"];
  s += "</a>";
  s += ")";
  return textohtml(s);
}

$(function() {
  $.get("../assets/bibliography.bib", function (bibtext) {
    $(function () {
      var bibs = doParse(bibtext);
      _.each(
        bibs,
        function (citation, citation_id) {
          // [@foo2001]
          replace_html(new RegExp('\\[.*@' + citation_id + '.*\\]', 'i'),
                       format_refp(citation))

          // @foo2011
          replace_html(new RegExp('@' + citation_id, 'i'),
                       format_reft(citation))

        }
      );
    });
  })

})

// Footnotes
//var littlefoot = require('littlefoot').default
//littlefoot()
