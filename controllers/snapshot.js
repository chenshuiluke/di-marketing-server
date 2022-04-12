const CircularJSON = require("circular-json");
const axios = require("axios");

module.exports = {
    sendSnapshot: (req, res) => {
        axios
          .post("https://hooks.zapier.com/hooks/catch/3271413/o011nq0", req.body)
          .then((zapResponse) => {
            console.log(zapResponse)
            let json = CircularJSON.stringify(zapResponse);
            res.status(200).send(json);
          });
      },
}
