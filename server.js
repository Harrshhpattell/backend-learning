const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const app = require("./app");

// console.log(app.get("env"));
// development
// console.log(process.env);

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`app running on port ${port}...`);
});

// environment variable
// npm i dotenv
// NODE_ENV=development nodemon server.js or create(extension=Dotenv) config.env file
