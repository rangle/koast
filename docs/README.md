- [Basics](#basics)
  - [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Setting up Routes](#setting-up-routes)
  - [Static Routes](#static)
  - [Module Routes](#module)
  - [Migrating older Koast Routes](#migrating-older-koast-applications)
- [Mongo Mapper](#mongo-mapper)

# Basics #

Koast is a framework that aims to simplify many of the common operations needed to get a server up and running.

It features a route loader, mapping routes to mongo queries, authentication, emailers, AWS, push notifications, enviroment based configurations and more.

Koast aims to have sensible defaults to quickly get up and running, that are easily overridable and configurable.

## Getting Started ##

To get started with Koast, either install via npm:

`npm install koast`

Or, clone the repo and link it locally

```bash
git clone https://github.com/rangle/koast.git && cd
npm link
```

and in your application directory:

`npm link koast`

A basic server/app.js would look like:

```javascript
'use strict';

var koast = require('koast');

koast.config
  .loadConfiguration()
  .then(koast.serve)
  .then(null, function(err) {
    console.log('Something went wrong starting koast', err);
  });

```

Fire up the application with `node server/app.js`, and you should land on a basic page.

#Configuration#

Koast uses [shortstop](https://github.com/krakenjs/shortstop) and [confit](https://github.com/krakenjs/confit)  to help manage the configuration, and environment specific configuration.

Your application should have a configuration structure like:

```
├── config
│   └── app.json
│   └── development.json
│   └── staging.json
│   └── production.json
```

the app.json contains common configuration that will be used across all environment as the base default settings. Each environment can have custom configuration in the appropriate .json file.

Koast will pick up the environment from the NODE_ENV setting, if none is found it will default to development.

A full app.json might look something like:
```json
{
  "app": {
    "indexHtml": "path:../client/index.html",
    "portNumber": 3001,
    "routes": [{
      "route": "/api/v1",
      "type": "module",
      "module": "server/lib/api"
    }]
  },
  "authentication": {
    "strategy": "password",
    "maintenance": "token"
  },
  "cors": {

    "origin": "*",
    "headers": "X-Requested-With, Content-Type, Authorization",
    "methods": "GET,POST,PUT,DELETE,OPTIONS, Authorization",
    "credentials": true

  },
  "databases": [{
    "host": "127.0.0.1",
    "port": "27017",
    "db": "erg",
    "schemas": "./server/schemas.js",
    "handle": "_"
  }],
  "secrets": {
    "authTokenSecret": "catsaretheinternet"
  }
}
```

When Koast loads up the configuration for other environments, it will merge the settings from the other .json files. You only need to include the settings that you want to override, and not the entire file.

For example, if you want to launch koast on port 8080 on development, your development.json would only need to contain

```json
{
  "app":
  {
    "portNumber": "8080"
  }
}
```
All of the other settings from app.json will remain the same.

Since Koast is using [shortstop](https://github.com/krakenjs/shortstop) to load the configuration files, we are able to specify 'protocols' as values for keys. What this allows you to do is split your configuration into multipul files, pull in values from enviroment settings, etc.

For example, if you wanted to keep your database configuration in a seperate file, you could configure it like:

```json
{
  "databases": "import:./path/to/database.json"
}
```

This will load up your database.json and set it as the value for databases. If you want to pull in a value from an environment variable:

```json
{
  "databases": [{
    "host": "env:HOST",
    "port": "27017",
    "db": "erg",
    "schemas": "./server/schemas.js",
    "handle": "_"
  }]
}
```

and it will pull in the value of the HOST environment variable, and set that as the value.

Please see the documentation for [shortstop](https://github.com/krakenjs/shortstop) and [shortstop-handlers](https://github.com/krakenjs/shortstop-handlers) for more information.

#Setting up Routes#

In the **app** section of your configuration, there is a section called routes. Koast will mount two types of routes for you - static, and module.

```json
{
  "app": {
    "routes": [{
      "route": "/api/v1", // base url of the route
      "type": "module",   // type of the route - module or static
      "module": "server/lib/api" // if a module, location to find the module
    }]
  }
}
```

## static ##

~~todo: complete static documentation~~

## module ##

The module definition in Koast 0.4.x has changed from 0.2.x. Previously, Koast expected a module to export the following

```javascript
'use strict';

export.defaults = {};
export.defaults.authorication = function(req, res) { return true; };
export.routes = [{
    method: ['get', 'put'],
    route: 'tasks/:_id',
    handler: mapper.auto({
        model: 'tasks'
    })
}]
```

Koast 0.4.x now expects the format:

```javascript
var router = require('express').Router();
// setup express 4 router

exports.koastModule =
{
  defaults: {
    authorization: function(req,res) {
      return true;
    }
  },
  router: router

}
```

Koast will still load 0.2.x style of modules, but will display a warning message that this will be deprecated.

###Migrating older Koast applications###
Being able to define your routes as an array is still supported however via the koast-router module. To migrate to a 0.4.x application:

```javascript
var koastRouter = require('koast').koastRouter;

var defaults =
{
  authorization: function(req,res)
  {
    return true;
  }
};
var routes = [{
    method: ['get'],
    route: 'tasks/:_id',
    handler: mapper.get({
        model: 'tasks'
    })
}];

exports.koastModule =
{
  defaults: defaults,
  router: koastRouter(routes,defaults)  
}
```

#Mongo Mapper#

Mongo mapper is a helper that creates handlers to a mongo collection, with the ability mount authorization, annotators, query decorators and filters easily into the requests.

##Basic Usage##

Provided that a schema 'tasks' is defined, to quickly setup end points to work with the tasks collection, your routes collection would look like:

```javascript

var koastRouter = require('koast').koastRouter;

var defaults =
{
  authorization: function(req,res)
  {
    return true;
  }

};
var routes = [{
  method: 'get',
  route: 'tasks/',
  handler: mapper.get({
    model: 'tasks'
  })
}, {
  method: 'get',
  route: 'tasks/:_id',
  handler: mapper.get({
    model: 'tasks'
  })
}, {
  method: 'post',
  route: 'tasks/',
  handler: mapper.post({
    model: 'tasks'
  })
}, {
  method: 'put',
  route: 'tasks/:_id',
  handler: mapper.put({
    model: 'tasks'
  })
}];

exports.koastModule =
{
  defaults: defaults,
  router: koastRouter(routes,defaults)  
}
```

This will create routes that will support get - all tasks, get a task by id, adding a new task, and updating an existing task.

~~todo document mapper options, use envelope, how annotators/etc only get called if envelopes are being used, give example responses~~

##Annotators##

Annotators are executed after a result is returned from the database, but before the result is sent to the client. These can be used to add additional meta-data to the results, or transform information into a more appropiate format.

When using annotators, the **useEnvelope** option needs to be set to true, this will wrap the response into an object containing the properties 'meta' and 'data', where data is the actual result.

```javascript

function isOwner(data, req) {
  if (req.user && req.user.data) {
    return data.owner == req.user.data.username;
  } else {
    return false;
  }
}

function annotator(req, item, res) {
  item.data.fullTitle = item.data.owner + ":" + item.data.description;
  item.meta.can = {
    edit: isOwner(item.data, req)
  };
  return item;
}

var routes = [{
  method: 'get',
  route: 'tasks/',
  handler: mapper.get({
    model: 'tasks',
    useEnvelope: false
  })
},
{
  method: 'get',
  route: 'tasks-plus/',
  handler: mapper.get({
    model: 'tasks',
    useEnvelope: true,
    annotator: annotator
  })
}

exports.koastModule =
{
  defaults: defaults,
  router: koastRouter(routes,defaults)  
}
```

When getting a list of tasks, it will now contain some meta-data, and have a new property called fullTitle.

`curl http://localhost:3001/api/v1/tasks` returns:
```json
[{
  "_id": "5417116638a36a97126b3da2",
  "owner": "alice",
  "description": "local task 1",
  "__v": 0
}]
```

`curl http://localhost:3001/api/v1/tasks-plus` returns:
```json
[{
  "meta": {
    "can": {
      "edit": false
    }
  },
  "data": {
    "_id": "5417116638a36a97126b3da2",
    "owner": "alice",
    "description": "local task 1",
    "__v": 0,
    "fullTitle": "alice:local task 1"
  }
}]
```
