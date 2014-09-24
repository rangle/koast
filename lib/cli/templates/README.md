This is a sample Koast app using express.

To run it:

1. `cd` to this directory.

2. Start Mongo.

3. Install koast npm package using 'npm link'.

4. Install koast bower package using 'bower link'.

5. Load the contents of data/robots.json into the database using the following
   command:

       koast load --col=robots --src=data/robots.json

   (If you haven't installed koast globally, you would need to use
   `./node_modules/.bin/koast` instead of `koast`.)

6. Add a record for "localkoast.rangle.io" to your hosts file:

    127.0.0.1       localkoast.rangle.io

6. Start the server with `node server/app.js`. (You can also use nodemon, etc.)

7. Access the application at http://localkoast.rangle.io:3000/

Note: The sample application uses OAuth for authentication, so we cannot run
it as "localhost". Instead, we set "localkoast.rangle.io" as an alias for
127.0.0.1 and then access the app using that address.




