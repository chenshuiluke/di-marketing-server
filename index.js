require("dotenv").config();
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const port = 8200;
const urlBuilder = require("./controllers/url-builder");
const partnerCreation = require("./controllers/partner_creation");
const snapshot = require("./controllers/snapshot");
const referral = require("./controllers/referral");
app.use(express.json());
app.use(cors());

const dbURI = process.env.DB_URI;

mongoose
  .connect(dbURI)
  .then((result) => app.listen(port, () => console.log(`Listening on ${port}`)))
  .catch((err) => console.error(err));


// var conn = new jsforce.Connection({
//   // you can change loginUrl to connect to sandbox or prerelease env.
//   loginUrl: "https://login.salesforce.com/",
// });

// conn.login(
//   process.env.SF_USERNAME,
//   process.env.SF_PASSWORD,
//   function (err, userInfo) {
//     if (err) {
//       return console.error(err);
//     }
//     // Now you can get the access token and instance URL information.
//     // Save them to establish connection next time.
//     // console.log(conn.accessToken);
//     // console.log(conn.instanceUrl);
//     // // logged in user property
//     // console.log("User ID: " + userInfo.id);
//     // console.log("Org ID: " + userInfo.organizationId);
//     // ...
//   }
// );

// MARKETING URL BUILDER
app.post("/api/shortenUrl", urlBuilder.createMarketingUrl);
// SNAPSHOT ROUTE
app.post("/api/sendSnapshot", snapshot.sendSnapshot);
// PAGE CREATION ROUTES
app.post("/api/addPartner", partnerCreation.addPartner);
app.get("/api/getGrowthPartners", partnerCreation.getGrowthPartners);
app.get("/api/getOSPartners", partnerCreation.getOSPartners);
app.get("/api/getModentoPartners", partnerCreation.getModentoPartners);
app.get("/api/getLinks", urlBuilder.getAllLinks)

// CUSTOMER REFERRAL ROUTES
app.get("/api/createReferralLink", referral.createReferralLink)