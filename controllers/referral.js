require("dotenv").config();
const axios = require("axios");

module.exports = {
  createReferralLink: async (req, res) => {
    var num = Math.floor(1000 + Math.random() * 9000);
    const { utmCampaign, campaignId, slashTag, accountId } = req.query;

    let destinationUrl = `https://get.dentalintel.com/watch/?campaign_id=${campaignId}&utm_campaign=${utmCampaign}&utm_source=customer_referrral&account_id=${accountId}`;
    const headers = {
      "Content-Type": "application/json",
      apikey: process.env.REBRAND_API_KEY,
    };

    let endpoint = "https://api.rebrandly.com/v1/links";

    let linkRequest = {
      destination: destinationUrl,
      domain: { fullName: "get.dentalintel.net" },
      slashtag: slashTag + num,
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
      res.status(200).send(link.shortUrl);
    } catch (err) {
      if (err.response) {
        res.status(200).send(err.response.data.errors[0].message);
        console.log(err.response.data.errors[0].message);
      } else {
        console.log(err);
      }
    }
  },
};
