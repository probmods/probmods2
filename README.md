## Setting up

### Dependencies

Make sure `npm` is up-to-date:

```sh
$ npm update -g npm
```

This may take a while. Next, run:

```sh
$ npm install -g browserify uglifyjs watchify grunt-cli
```

Next, you need to install jekyll. If installing on a Mac, this can be complicated because MacOS's default Ruby installation is incompatible. Instead, install and use `rbenv` to set up virtual ruby environments:

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

The first line below installs some dependencies that aren't available through NPM. The second line installs all the NPM-managed dependencies listed in `package.json`.

```sh
$ brew install pkg-config cairo pango libpng jpeg giflib
$ npm install
```

If you run into problems on the first step, you may need to update homebrew or some of its dependencies. Try:

```sh
$ brew update
$ brew upgrade
```

Then run `npm install` again.

### Final step
From the root directory:

```
$ scripts/deploy
```

This updates all dependencies and copies them to the assets folder. Note that there are several custom javascript libraries in `assets` that are NOT maintained through nmp: 

* box2d.js
* plinko.js
* parse-bibtex.js

## Running locally

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
