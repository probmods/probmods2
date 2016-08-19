**setting up**

```sh
bower install
```


**compiling**

```sh
jekyll serve --watch --incremental
```

**style guide**

- put every sentence on its own line.
- trim leading and trailing whitespace from lines.
- use `~~~~ norun` for non-runnable code blocks.
- the math delimiter is `$$`, e.g., `$$x + 5$$`.
- make math blocks just by putting a math on its own line, e.g.,

```
foo bar Bayes Theorem:

$$ P(A \mid B) \propto P(A)P(B \mid A) $$

note that this immediately follows from baz quux
```

- as shown above, use `\mid` for the vertical pipe (`|` screws up the tex rendering engine)
