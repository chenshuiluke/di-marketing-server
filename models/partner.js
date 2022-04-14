const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const partnerSchema = new Schema(
  {
    partner_name: String,
    partner_logo: String,
    long_url: String,
    short_url: String,
    campaign_id: String,
    page_type: String,
    visits: Number,
    submissions: Number,
  },
  {
    timestamps: true,
  }
);

const Partner = mongoose.model("Partner", partnerSchema);

module.exports = Partner
