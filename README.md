This is Koast's server side. It's organized as an NPM package providing a
requirable module ("koast") and an executable (also "koast"), which offers some
utilities. You cannot run the server by itself - you'll need to write a simple
app using the koast module. See examples in the "examples" folder in the root
of the repository.

To use git version of the module, install it locally using npm link:

  https://www.npmjs.org/doc/cli/npm-link.html

To use the executable, install the package globally (with -g). 


# So you wanna make a Koast app?


## Some things you need to know

### WTF does koast even do?

Someone tell me :P

### WTF is a koastModule?

*FIXME*
Well, son... A koast module is a javscript file which exports an object
containing the property `koastModule`. *_wow_*


A koast module contains the following:

Property |  Required | Data
---------------------------
router   |  true     |  [Express 4 router](http://expressjs.com/4x/api.html#router)
defaults |  true     |  Default handlers, **must** contain `authorization` function.


We'll show you how to define, and use your
own `koastModule`s to build an application server.



## Starting your Koast app

### mkdir -p, touch, whatever, Go!

```
├── client
│   └── index.html
├── config
│   └── local
│       ├── app.json
├── package.json
└── server
    ├── api.js
    ├── app.js
    └── schemas.js
```

### The server

The "proper" http server should be located in `server/app`. You will typically
launch your application with `node server/app.js`.

```javascript
// server/app.js

var koast = require('koast');
koast.config.setEnvironment();
koast.serve();
```

### Defining a simple koastModule

Let's make our first `koastModule`!

```javascript
var express = require('express');
var router = express.Router();

router.use('/world', function(req, res) {
  res.send('Hello, koast!');
});

module.exports = exports = {
  koastModule: {
    router: router
  }
};
```
