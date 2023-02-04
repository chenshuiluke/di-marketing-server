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
const { setIntervalAsync, clearIntervalAsync } = require("set-interval-async");
const Webflow = require("webflow-api");
app.use(express.json());
app.use(cors());

const dbURI = process.env.DB_URI;
const tagMap = {};
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
app.get("/api/getEngagementPartners", partnerCreation.getEngagementPartners);
app.get("/api/getAnalyticsPartners", partnerCreation.getAnalyticsPartners);
app.get("/api/getBundlePartners", partnerCreation.getBundlePartners);
app.get("/api/getLocalMedPartners", partnerCreation.getLocalMedPartners);
app.get(
  "/api/getGrowthReportPartners",
  partnerCreation.getGrowthReportPartners
);
app.get("/api/getLinks", urlBuilder.getAllLinks);

// CUSTOMER REFERRAL ROUTES
app.get("/api/createReferralLink", referral.createReferralLink);

app.get("/api/tags", async (req, res, next) => {
  return res.json(tagMap);
});

(async () => {
  setIntervalAsync(async () => {
    try {
      const apiKey = process.env.API_KEY;
      const siteId = "6266d8ef8c92b1230d1e0cbb";
      const webflow = new Webflow({ token: apiKey });
      const resourceTagCollectionId = "63d0230e5f82552be2fede80";
      const site = await webflow.site({
        siteId: siteId,
      });
      const collections = await site.collections();
      // console.log(collections);
      const collectionIds = [
        "63d7c5b7639bac4c0ee20ec5", // Ebook
        "639f79531caa80c3bc3c1642", //Blog
        "639f79531caa805a773c1641", //Webinar
        "63d7f65be924356771d1f865", //Testimonial
        "639f79531caa80e8fb3c1640", // Podcast
      ];
      const tags = await webflow.items({
        collectionId: resourceTagCollectionId,
      });
      const tagIdNameMap = {};
      for (const tag of tags) {
        tagIdNameMap[tag._id] = tag.name;
      }
      for (const collectionId of collectionIds) {
        const items = await webflow.items({
          collectionId: collectionId,
        });
        // console.log(items);
        for (const item of items) {
          if (
            item != null &&
            item["tag-dropdown"] != null &&
            Array.isArray(item["tag-dropdown"])
          ) {
            tagMap[item.name.trim()] = item["tag-dropdown"].map((tagId) => {
              return tagIdNameMap[tagId];
            });
          }
        }
      }
      // console.log(tagMap);
    } catch (e) {
      // Deal with the fact the chain failed
      console.error(e);
    }
  }, 60000);
  // `text` is not available here
})();
