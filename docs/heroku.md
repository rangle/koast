# Setting up a Koast app on Heroku.

## The Basics

Setup a git repository with npm package.json in the root of the repository.

    mkdir koast-heroku-example
    cd koast-heroku-example/
    git init
    npm init

When running `npm init`, specify `server/app.js` as the “entry point.”

Install Koast and create server, client, and config directories, as per
recommended setup.

    npm install --save koast
    mkdir server
    mkdir client
    mkdir config
    mkdir config/local
    mkdir config/production

Edit `client/index.html`, `server/app.js`, `config/production/app.json`, etc,
to your liking.

IMPORTANT: Your `server/app.js` should listent to the port specified by
`process.env.PORT`.

## Databases

If your app needs databases, set those up on mongolab (or some other provider)
and put the configuration info into `config/production/databases.js`.

## Bower

If your app uses bower, setup `bower.json` file in your root directory. Run

    npm install --save bower

to add bower to your `package.json`. Then add this postinstall script to your `package.json`:

    "postinstall": "./node_modules/bower/bin/bower install"

## Procfile

Create a file called “Procfile” that reads:

    web: node server/app.js

Test this using `foreman start`.

## Deploying

Add and commit all the files, then create a heroku app and push the changes:

    heroku create
    git push heroku master

Go to the app:

    heroku open
