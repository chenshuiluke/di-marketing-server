require("dotenv").config();
const axios = require("axios");
const { google } = require("googleapis");

module.exports = {
  createMarketingUrl: async (req, res) => {
    const auth = new google.auth.GoogleAuth({
      keyFile: "credentials.json",
      scopes: "https://www.googleapis.com/auth/spreadsheets",
    });

    const client = await auth.getClient();
    const googleSheets = google.sheets({
      version: "v4",
      auth: client,
    });
    const spreadsheetId = process.env.SPREADSHEET_ID;

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

      await googleSheets.spreadsheets.values.append({
        auth,
        spreadsheetId,
        range: "url_list!A:D",
        valueInputOption: "USER_ENTERED",
        resource: {
          values: [[req.body.campaignName, link.shortUrl, req.body.destinationUrl, req.body.utmContent]],
        },
      });
      res.status(200).send(link.shortUrl);
      console.log(link.shortUrl);
    } catch (err) {
      res.status(403).send(err);
    }
  },
};
