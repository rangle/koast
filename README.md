Koast provides a base for a backend server to support an AngularJS app. (It may
be useful for Javascript apps built with other frameworks as well, but our
focus is on Angular.) The goal is to quickly setup a server that would take
care of things that a typical AngularJS app would need (such as configuration,
authentication, and database access) without resorting to code generation.

Koast consists of two parts:

- A server side npm module "koast", which you can install with `npm install
  koast`. This module allows you to create a server. In a typical case, you
  would write a few lines of code to instantiate and start a server, defining
  most of the functionality through configuration files, a schema file, and a
  module implementing the API.

- A client-side bower package "koast", which you can install with `bower
  install koast`. This provides an AngularJS module that helps your frontend
  app talk to the backend server. You don't have to use it: if you prefer you
  can just talk to the server directly. However, the frontend module might save
  you a bit of time.

# Features

- Static file serving with LESS conversion.
- Authentication via Facebook, Twitter, and Google.
- Mongo integration with automatic REST mapping.
- AWS S4 integration.
- Authorization based on ownership.
- A client-side package for easier access.
- Deployable to Heroku.

# Recommended Setup

The recommended application setup:

    package.json
    bower.json
    /config
      local
        app.json
        databases.json
      production
        app.json
        databases.json
    /server
      app.js
      lib
        api.js
    /client
      app
        index.html
        <all of your front end code, css, templates>
      bower_components
      custom_components
        <3rd party components you install bypassing bower>
    
See `examples/basic-express/` for an example.

# Deployment

See docs/heroku.md for heroku deployment procedure.