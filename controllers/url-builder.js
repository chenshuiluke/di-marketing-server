require("dotenv").config();
const axios = require("axios");
module.exports = {
  createMarketingUrl: async (req, res) => {
    const headers = {
      "Content-Type": "application/json",
      apikey: process.env.REBRAND_API_KEY,
    };

    let endpoint = "https://api.rebrandly.com/v1/links";
    let linkRequest = {
      destination: req.body.destinationUrl,
      domain: { fullName: "get.dentalintel.net" },
      slashtag: req.body.slashTag,
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
      console.log(link.shortUrl)
    } catch (err) {
      res.status(500).send(err);
      console.log(err)
    }
  },
};
