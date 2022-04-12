require("dotenv").config();
const cors = require('cors');
const express = require("express");
const app = express();
const port = 8200;
const jsforce = require("jsforce");
const urlBuilder = require("./controllers/url-builder");
const snapshot = require("./controllers/snapshot");
app.use(express.json());
app.use(cors())


 

var conn = new jsforce.Connection({
  // you can change loginUrl to connect to sandbox or prerelease env.
  loginUrl: "https://login.salesforce.com/",
});

conn.login(
  process.env.SF_USERNAME,
  process.env.SF_PASSWORD,
  function (err, userInfo) {
    if (err) {
      return console.error(err);
    }
    // Now you can get the access token and instance URL information.
    // Save them to establish connection next time.
    // console.log(conn.accessToken);
    // console.log(conn.instanceUrl);
    // // logged in user property
    // console.log("User ID: " + userInfo.id);
    // console.log("Org ID: " + userInfo.organizationId);
    // ...
  }
);

app.post("/api/shortenUrl", urlBuilder.createMarketingUrl);
app.post("/api/sendSnapshot", snapshot.sendSnapshot);

app.listen(port, () => console.log(`Listening on ${port}`));
