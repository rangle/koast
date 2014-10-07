This is Koast's server side. It's organized as an NPM package providing a
requirable module ("koast") and an executable (also "koast"), which offers some
utilities. You cannot run the server by itself - you'll need to write a simple
app using the koast module. See examples in the "examples" folder in the root
of the repository.

To use git version of the module, install it locally using npm link:

  https://www.npmjs.org/doc/cli/npm-link.html

To use the executable, install the package globally (with -g).


# What is a Koast app?

Koast provides a base for a backend server to support an AngularJS app. (It may be useful for Javascript apps built with other frameworks as well, but our focus is on Angular.) The goal is to quickly setup a server that would take care of things that a typical AngularJS app would need (such as configuration, authentication, and database access) without resorting to code generation.

Koast consists of two parts:

A server side npm module "koast", which you can install with npm install koast. This module allows you to create a server. In a typical case, you would write a few lines of code to instantiate and start a server, defining most of the functionality through configuration files, a schema file, and a module implementing the API.

A client-side bower package "koast", which you can install with bower install angular-koast. This provides an AngularJS module that helps your frontend app talk to the backend server. You don't have to use it: if you prefer you can just talk to the server directly. However, the frontend module might save you a bit of time.

# What is a koastModule?

Koast Modules are defiend in your configuration under the "routes" section of your app.json, they can be defined as static or as a module.

Koast Modules are expected to export an object with a defaults object, and a router object.

```javascript
// my module

var express = require('express');
var router = express.Router();
// setup module & router

module.exports = exports = {
  defaults: { authorization: function() { return true; }},
  koastModule: {
    router: router
  }
};

```

A Koast module contains the following:

| Property | Required | Data |
|----------|----------|------|
| router   |  true    |  [Express 4 router](http://expressjs.com/4x/api.html#router)  |
| defaults |  true    |  Default handlers, **must** contain `authorization` function. |


We'll show you how to define, and use your
own `koastModule`s to build an application server.

## Starting your Koast app

#### Suggested Folder Setup

```
├── package.json
├── bower.json
├── client
│   └── index.html
├── config
│   ├── app.json          -- common configuration settings
│   ├── development.json  -- environment specific configuration
│   ├── staging.json
│   └── production.json
└── server
│   ├── lib
      └── api.js          -- koast modules to be loaded
    ├── app.js            -- server entry point
    └── schemas.js
```

### The server

The http server should be located in `server/app.js`. You will typically
launch your application with `node server/app.js`.

```javascript
// server/app.js

var koast = require('koast');
koast.config.loadConfiguration();
koast.config.whenReady.then(koast.serve);
```

### Hello, koastModules!

Let's make our first `koastModule`!

```javascript
// server/lib/api.js

var express = require('express');
var router = express.Router();

router.use('/world', function(req, res) {
  res.send('Hello, koast!');
});

module.exports = exports = {
  defaults: { authorization: function() { return true; }},
  koastModule: {
    router: router
  }
};
```

Next, we will cover how to hook your API up to the server.

## Configuring your koast application

The first thing we're going to want to configure, is our koastModule.

### Connecting the application

```javascript
// example config/app.json
{
  "app": {
    "portNumber": 3001,
    "routes": [{
      "route": "/api/v1",
      "type": "module",
      "module": "server/lib/api" // load the module in server/lib/api.js
    }]
  }
}
```

This will load the express router from server/api and mount it to
`/api/v1/`. So the route `/api/v1/world` will be accessible.
