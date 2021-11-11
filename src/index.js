const app = require("./app");
const port = 3000;
async function main() {
  await app.listen(process.env.PORT || port);
  console.log("Server on port", port);
}

main();