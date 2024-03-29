require("dotenv").config();
const axios = require("axios");
const Partner = require("./../models/partner");

module.exports = {
  addPartner: async (req, res) => {
    let {
      partnerName,
      partnerLogo,
      campaignId,
      slashTag,
      destinationUrl,
      pageType,
    } = req.body;

    const headers = {
      "Content-Type": "application/json",
      apikey: process.env.REBRAND_API_KEY,
    };
    let endpoint = "https://api.rebrandly.com/v1/links";
    if (process.env.NODE_ENV == "development") {
      destinationUrl = destinationUrl.replace(
        "https://www.dentalintel.com",
        "https://di-marketing-site.webflow.io"
      );
    }
    let linkRequest = {
      destination: destinationUrl,
      domain: {
        fullName:
          pageType != "LocalMed" ? "info.dentalintel.com" : "getlocalmed.com",
      },
      slashtag: slashTag,
    };

    const apiCall = {
      method: "post",
      url: endpoint,
      data: linkRequest,
      headers: headers,
    };

    try {
      let apiResponse = await axios(apiCall);
      let link = apiResponse.data;
      const partner = new Partner({
        partner_name: partnerName,
        partner_logo: partnerLogo,
        long_url: destinationUrl,
        short_url: link.shortUrl,
        campaign_id: campaignId,
        page_type: pageType,
        visits: 0,
        submissions: 0,
      });

      partner
        .save()
        .then((result) => {
          res.status(200).send(link.shortUrl);
        })
        .catch((err) => console.log(err));

      console.log(link.shortUrl);
    } catch (err) {
      if (err.response) {
        res.status(200).send(err.response.data.errors[0].message);
        console.log(err.response.data.errors[0].message);
      } else {
        console.log(err);
      }
    }
  },
  getEngagementPartners: (req, res) => {
    Partner.find({ page_type: "Engagement" })
      .then((partners) => {
        res.status(200).send(partners);
      })
      .catch((err) => console.log(err));
  },
  getAnalyticsPartners: (req, res) => {
    Partner.find({ page_type: "Analytics" })
      .then((partners) => {
        res.status(200).send(partners);
      })
      .catch((err) => console.log(err));
  },
  getBundlePartners: (req, res) => {
    Partner.find({ page_type: "Bundle (Engagement + Analytics)" })
      .then((partners) => {
        res.status(200).send(partners);
      })
      .catch((err) => console.log(err));
  },
  getGrowthReportPartners: (req, res) => {
    Partner.find({ page_type: "Growth Report" })
      .then((partners) => {
        res.status(200).send(partners);
      })
      .catch((err) => console.log(err));
  },
  getLocalMedPartners: (req, res) => {
    Partner.find({ page_type: "LocalMed" })
      .then((partners) => {
        res.status(200).send(partners);
      })
      .catch((err) => console.log(err));
  },
};
