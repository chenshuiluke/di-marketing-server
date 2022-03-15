require('dotenv').config()
const express = require("express");
const app = express();
const port = 8200;
let jsforce = require("jsforce");
app.use(express.json());

var conn = new jsforce.Connection({
  // you can change loginUrl to connect to sandbox or prerelease env.
  loginUrl: "https://login.salesforce.com/",
});

conn.login(process.env.SF_USERNAME, process.env.SF_PASSWORD, function (err, userInfo) {
  if (err) {
    return console.error(err);
  }
  // Now you can get the access token and instance URL information.
  // Save them to establish connection next time.
  console.log(conn.accessToken);
  console.log(conn.instanceUrl);
  // logged in user property
  console.log("User ID: " + userInfo.id);
  console.log("Org ID: " + userInfo.organizationId);
  // ...
});

app.get("/api/test", (req, res) => {
  res.status(200).send("Working");
});

app.get("/api/test2", (req, res) => {
  res.status(200).send("Working two");
});

app.listen(port, () => console.log(`Listening on ${port}`));
