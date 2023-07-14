const axioss = require("axios");

axioss
  .get("https://api.github.com/users/henacodes/repos")
  .then((res) => console.log(res))
  .catch((err) => console.log(err));
