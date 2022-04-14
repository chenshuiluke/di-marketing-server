require("dotenv").config();
const axios = require("axios");
const Partner = require("./../models/partner");

module.exports = {
  addPartner: async (req, res) => {
    const { partnerName, partnerLogo, campaignId, slashTag, destinationUrl, pageType } =
      req.body;

    const headers = {
      "Content-Type": "application/json",
      apikey: process.env.REBRAND_API_KEY,
    };
    let endpoint = "https://api.rebrandly.com/v1/links";

    let linkRequest = {
      destination: destinationUrl,
      domain: { fullName: "get.dentalintel.net" },
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
          console.log(err)
      }
    }
  },
  getGrowthPartners: (req, res) => {
    Partner.find({page_type: 'Growth Platform'})
      .then((partners) => {
        res.status(200).send(partners);
      })
      .catch((err) => console.log(err));
  },
  getOSPartners: (req, res) => {
    Partner.find({page_type: 'LocalMed'})
      .then((partners) => {
        res.status(200).send(partners);
      })
      .catch((err) => console.log(err));
  },
  getModentoPartners: (req, res) => {
    Partner.find({page_type: 'Modento'})
      .then((partners) => {
        res.status(200).send(partners);
      })
      .catch((err) => console.log(err));
  },
};
