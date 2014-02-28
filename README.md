Koast provides a base for a backend server for an AngularJS app. (It my be
useful for Javascript apps built with other frameworks as well, but our focus
here is on Angular.) The purpose of Koast is to help you get quickly setup a
server that would take care of things that a typical AngularJS app would need
(such as configuration, authentication, and database access) without resorting
to code generation.

As of mid February 2014, Koast is an early stage project – don't plan on
putting this in production quite yet.

Koast consists of two parts:

- a server side npm module "koast"
- a client-side bower package "koast"

The npm package allows you to create a server. In a typical case, you would
write a few lines of code to instantiate and start a server, defining most of
the functionality through configuration files, a schema file, and a module
implementing the API.

The bower package provides an AngularJS module that can helps you talk to the
server.

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