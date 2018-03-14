## Setting up

### Dependencies

You will need jekyll. If installing on a Mac, this can be complicated because MacOS's default Ruby installation is incompatible. Instead, install and use `rbenv` to set up virtual ruby environments:

```sh
$ brew install rbenv
$ rbenv init
```

Next, add `~/.rbenv/shims` to your PATH. 

Close and open your terminal window so that `rbenv` loads. Confirm that it is working with:

```sh
$ curl -fsSL https://github.com/rbenv/rbenv-installer/raw/master/bin/rbenv-doctor | bash
```

If everything check out, you can now install a new version of Ruby and set it as your global default. For instance:

```sh
$ rbenv install 2.5.0
$ rbenv global 2.5.0
```

If you want to be able to use multiple versions of Ruby on your computer, read the `rbenv` [docs](https://github.com/rbenv/rbenv).

Now you can install jekyll:

```sh
$ gem install jekyll
```

### Installing packages

```sh
bower install
```

## compiling

```sh
jekyll serve --watch --incremental
```

### style guide

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
