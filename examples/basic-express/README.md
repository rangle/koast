This is a sample Koast app. To run it:

1. `cd` to this directory

2. Startup Mongo

3. Install koast npm package using 'npm link'

4. Load the contents of data/robots.json into the database using the following
   command:

       koast load --col=robots --src=data/robots.json

   (If you haven't installed koast globally, you would need to use
   `./node_modules/.bin/koast` instead of `koast`.)

5. Start the server with `node server/app.js`. (You can also use nodemon, etc.)

6. Access the application at http://localhost:3000/

