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
const moment = require("moment");
app.use(express.json());
app.use(cors());

const dbURI = process.env.DB_URI;
const tagMap = {};
const tagIdNameMap = {};
const featureIdNameMap = {};
const serviceTypeIdNameMap = {};
const webinarModuleNameMap = {};
const desiredOutcomeNameMap = {};
const podcastSeriesNameMap = {};
const webinarSeriesNameMap = {};
const demoEmailMap = {};
let serviceTypeList = [];
let featureList = [];
let productWebinarList = [];
let desiredOutcomesList = [];
let productWebinarNameAndModuleMap = {};
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

app.get("/api/resources/", async (req, res, next) => {
  if (req.query.type == null) {
    return res.json(sortedResources);
  }
  return res.json(
    sortedResources.filter((resource) => resource.contentType == req.query.type)
  );
});

app.get("/api/certified-partners/", async (req, res, next) => {
  return res.json({
    goldPartners,
    diamondPartners,
  });
});

app.get("/api/certified-partners/service-types", async (req, res, next) => {
  return res.json({
    serviceTypes: serviceTypeList,
  });
});

app.get("/api/resources/first-six", async (req, res, next) => {
  return res.json(first6Resources);
});

app.get("/api/product-webinars", async (req, res, next) => {
  return res.json(productWebinarList);
});

app.get("/api/product-webinars/module", async (req, res, next) => {
  return res.json(productWebinarNameAndModuleMap[req.query.name]);
});

app.get("/api/desired-outcomes", async (req, res, next) => {
  return res.json(desiredOutcomesList);
});

app.post("/api/check-demo-email", async (req, res, next) => {
  try {
    let email = req.body.email;
    if (email != null) {
      email = email.toLowerCase();
      const existingRecord = demoEmailMap[email];
      if (existingRecord == null) {
        demoEmailMap[email] = {
          numberOfSubmissions: 1,
          firstSubmissionDate: moment(),
        };
      } else {
        let hours = moment().diff(existingRecord.firstSubmissionDate, "hours");
        if (hours >= 72) {
          existingRecord.numberOfSubmissions = 0;
          existingRecord.firstSubmissionDate = moment();
        }
        if (existingRecord.numberOfSubmissions < 5) {
          existingRecord.numberOfSubmissions += 1;
        } else {
          return res.status(400).end({});
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
  res.json({});
});

const collectionIdMap = {
  ebook: "63ec21ad0687778cfffbae36",
  blog: "63ec21ad068777fbe9fbae33",
  webinar: "63ec21ad068777049bfbae30",
  testimonial: "63ec21ad0687771dfdfbae37",
  podcast: "63ec21ad068777c4effbae34",
  partner: "64bec95d1d0799a80325f918",
  productWebinar: "6508490b2d27c5402795c54e",
  services: "64bec9d0d9be11ef02b7dab3",
  proofFeatures: "63ec21ad0687773eccfbae38",
  tools: "65b7e5130431d0de5583e361",
};

let first6Resources = [];
let sortedResources = [];

let diamondPartners = [];
let goldPartners = [];

const getTags = (resource) => {
  if (resource.tags != null) {
    return resource.tags;
  }
  const tags = resource?.["tag-dropdown"]
    ?.filter((tagId) => {
      return tagIdNameMap[tagId] != null;
    })
    .map((tagId) => tagIdNameMap[tagId]?.toLowerCase());
  if (tags?.length > 0) {
    return tags.join(" ");
  }
  return "";
};

const getProductWebinarFeatures = (resource) => {
  if (resource.tags != null) {
    return resource.tags;
  }
  const features = resource?.["features"]
    ?.filter((id) => {
      return featureIdNameMap[id] != null;
    })
    .map((id) => featureIdNameMap[id]?.toLowerCase());
  if (features?.length > 0) {
    return features.join(" ");
  }
  return "";
};

const getTestimonialFeatures = (resource) => {
  const features = resource?.["features"]
    ?.filter((id) => {
      return featureIdNameMap[id] != null;
    })
    .map((id) => featureIdNameMap[id]?.toLowerCase());
  if (features?.length > 0) {
    return features.join(" ");
  }
  return "";
};

const getDesiredOutcomes = (resource) => {
  const desiredOutcomes = resource?.["desired-outcomes"]
    ?.filter((id) => {
      return desiredOutcomeNameMap[id] != null;
    })
    .map((id) => desiredOutcomeNameMap[id]?.toLowerCase());
  if (desiredOutcomes?.length > 0) {
    return desiredOutcomes.join(" ");
  }
  return "";
};

const getPodcastSeries = (resource) => {
  const podcastSeries = resource?.["podcast-series"]
    ?.filter((id) => {
      return podcastSeriesNameMap[id] != null;
    })
    .map((id) => podcastSeriesNameMap[id]?.toLowerCase());
  if (podcastSeries?.length > 0) {
    return podcastSeries.join(" ");
  }
  return "";
};

const getWebinarSeries = (resource) => {
  const webinarSeries = resource?.["webinar-series-new"]
    ?.filter((id) => {
      return webinarSeriesNameMap[id] != null;
    })
    .map((id) => webinarSeriesNameMap[id]?.toLowerCase());
  if (webinarSeries?.length > 0) {
    return webinarSeries.join(" ");
  }
  return "";
};

const getServiceTypes = (partner) => {
  const tags = partner?.["services"]
    ?.filter((serviceId) => {
      return serviceTypeIdNameMap[serviceId] != null;
    })
    .map((tagId) => serviceTypeIdNameMap[tagId]?.toLowerCase());
  if (tags?.length > 0) {
    return tags.join(" ");
  }
  return "";
};

const getTier = (partner) => {
  const goldTierId = "6429739f9eb18ef372a572a04cfaa588";
  const diamondTierId = "c5a4718d254b82a56f60d5d6856e3a30";
  if (partner?.["partner-tier"] == goldTierId) {
    return "gold";
  }
  if (partner?.["partner-tier"] == diamondTierId) {
    return "diamond";
  }
};

const getAllFromCollection = async (webflow, collectionId) => {
  let allItems = [];
  let latestItems = [];
  let offset = 0;
  let limit = 100;
  do {
    const responseItems = await webflow.items({ collectionId, limit, offset });
    latestItems = responseItems;
    allItems = allItems.concat(latestItems);
    offset += latestItems.length;
  } while (latestItems.length != 0);
  return allItems.filter((item) => {
    return !item._archived && !item._draft;
  });
};

const getCertifiedPartners = async (webflow) => {
  const partnerResponse = await getAllFromCollection(
    webflow,
    collectionIdMap.partner
  );
  const partners = partnerResponse.map((partner) => {
    return {
      id: partner._id,
      title: partner?.name,
      image: partner?.["partner-image"]?.url,
      description: partner?.["description-2"],
      tier: getTier(partner),
      isTopPerformer: partner?.["is-top-performer"],
      partnerWebsite: partner?.["partner-website"],
      topPerformerCategory: partner?.["top-performer-category"],
      date: partner?.["updated-on"],
      link: `/certified-partners/${partner?.slug}`,
      order: partner?.["display-order"],
      contentType: "partner",
      services: getServiceTypes(partner),
    };
  });
  console.log("@@@", partners);
  return partners;
};

const getEbooks = async (webflow) => {
  const ebooksResponse = await getAllFromCollection(
    webflow,
    collectionIdMap.ebook
  );
  const ebooks = ebooksResponse.map((ebook) => {
    return {
      id: ebook._id,
      title: ebook?.name,
      image: ebook?.thumbnail?.url,
      description: ebook?.description,
      tags: ebook?.["tag-dropdown"],
      date:
        ebook?.["launch-date"] != null
          ? ebook?.["launch-date"]
          : ebook?.["updated-on"],
      link: `/ebooks/${ebook?.slug}`,
      contentType: "ebook",
      tags: getTags(ebook),
      desiredOutcomes: getDesiredOutcomes(ebook),
    };
  });
  console.log("@@@", ebooks);
  return ebooks;
};

const getTools = async (webflow) => {
  const toolsResponse = await getAllFromCollection(
    webflow,
    collectionIdMap.tools
  );
  const tools = toolsResponse.map((tool) => {
    return {
      id: tool._id,
      title: tool?.name,
      image: tool?.thumbnail?.url,
      description: tool?.description,
      tags: tool?.["tag-dropdown"],
      date:
        tool?.["launch-date"] != null
          ? tool?.["launch-date"]
          : tool?.["updated-on"],
      link: `/tools/${tool?.slug}`,
      contentType: "tool",
      tags: getTags(tool),
      desiredOutcomes: getDesiredOutcomes(tool),
    };
  });
  console.log("@@@", tools);
  return tools;
};

const getWebinars = async (webflow) => {
  const webinarsResponse = await getAllFromCollection(
    webflow,
    collectionIdMap.webinar
  );
  const webinars = webinarsResponse.map((webinar) => {
    return {
      id: webinar._id,
      title: webinar?.name,
      image: webinar?.thumbnail?.url,
      description: webinar?.["meta-description"],
      tags: webinar?.["tag-dropdown"],
      date: webinar?.["created-date"],
      link: `/webinars/${webinar?.slug}`,
      contentType: "webinar",
      tags: getTags(webinar),
      author: webinar?.["ce-credits"],
      desiredOutcomes: getDesiredOutcomes(webinar),
      webinarSeries: getWebinarSeries(webinar),
    };
  });
  console.log("@@@", webinars);
  return webinars;
};

const getProductWebinars = async (webflow) => {
  const webinarsResponse = await getAllFromCollection(
    webflow,
    collectionIdMap.productWebinar
  );

  const webinars = webinarsResponse.map(async (webinar) => {
    const moduleIdMap = {
      "8a06ae32566bcc0d84489c27a5e92f82": "insurance",
      caf5fd2abdc15a2a8a450a055a17049b: "monthly product webinars",
      fa5dd3b71d7fc53ee12aea90b49aa256: "localmed",
      "5cdce68b9bd6d3973075188dc4fb7b0c": "analytics",
      "46ba10a9bac64b7e99d5ca81fc8ec534": "engagement",
    };
    const result = {
      id: webinar._id,
      title: webinar?.name,
      image: webinar?.thumbnail?.url,
      description: webinar?.["meta-description"],
      tags: webinar?.["tag-dropdown"],
      date: webinar?.["created-date"] || webinar?.["created-on"],
      link: `/product-webinars/${webinar?.slug}`,
      contentType: "webinar",
      tags: getProductWebinarFeatures(webinar),
      author: webinar?.["ce-credits"],
      module: "empty module",
      desiredOutcomes: getDesiredOutcomes(webinar),
    };
    if (webinar?.["module-multiselect"] != null) {
      for (const moduleId of webinar["module-multiselect"]) {
        const module = webinarModuleNameMap[moduleId];
        result.module += ` ${module}`;
      }
      productWebinarNameAndModuleMap[webinar?.name] = result.module;
    } else {
      productWebinarNameAndModuleMap[webinar?.name] = null;
    }
    return result;
  });
  const results = await Promise.all(webinars);
  console.log("@@@ product webinars", results);
  return results;
};

const getPodcasts = async (webflow) => {
  const podcastResponse = await getAllFromCollection(
    webflow,
    collectionIdMap.podcast
  );
  const podcasts = podcastResponse.map((podcast) => {
    return {
      id: podcast._id,
      title: podcast?.name,
      image: podcast?.thumbnail?.url,
      description: podcast?.["meta-description"],
      tags: podcast?.["tag-dropdown"],
      date: podcast?.["created-date"],
      link: `/podcasts/${podcast?.slug}`,
      contentType: "podcast",
      tags: getTags(podcast),
      author: podcast?.series,
      episode: podcast?.["episode-number"],
      desiredOutcomes: getDesiredOutcomes(podcast),
      podcastSeries: getPodcastSeries(podcast),
    };
  });
  console.log("@@@", podcasts);
  return podcasts;
};

const getBlogs = async (webflow) => {
  const blogResponse = await getAllFromCollection(
    webflow,
    collectionIdMap.blog
  );
  const blogs = blogResponse.map((blog) => {
    return {
      id: blog._id,
      title: blog?.name,
      image: blog?.["featured-image-url"]?.url,
      description: blog?.["meta-description"],
      tags: blog?.["tag-dropdown"],
      date: blog?.["publish-date"],
      link: `/blog-posts/${blog?.slug}`,
      contentType: "blog",
      tags: getTags(blog),
      author: blog?.author,
      desiredOutcomes: getDesiredOutcomes(blog),
    };
  });
  return blogs;
};

const getTestimonials = async (webflow) => {
  const testimonialResponse = await getAllFromCollection(
    webflow,
    collectionIdMap.testimonial
  );
  const testimonials = testimonialResponse.map((testimonial) => {
    return {
      id: testimonial._id,
      title: testimonial?.name,
      image: testimonial?.thumbnail?.url,
      description: testimonial?.["quote"],
      tags: testimonial?.["tag-dropdown"],
      date: testimonial?.["created-on"],
      link: `/testimonials/${testimonial?.slug}`,
      contentType: "testimonial",
      author: testimonial?.["author"],
      tags: getTags(testimonial),
      features: getTestimonialFeatures(testimonial),
      desiredOutcomes: getDesiredOutcomes(testimonial),
      doNotShowDateInCard: true,
    };
  });
  // console.log("@@@", testimonials);
  return testimonials;
};

(async () => {
  setIntervalAsync(async () => {
    try {
      const apiKey = process.env.API_KEY;
      const siteId = "6266d8ef8c92b1230d1e0cbb";
      const webflow = new Webflow({ token: apiKey });

      const resourceTagCollectionId = "63ec21ad068777b053fbae35";
      const site = await webflow.site({
        siteId: siteId,
      });
      const collections = await site.collections();
      console.log(collections);
      // process.exit(0);
      const collectionIds = [
        "63ec21ad0687778cfffbae36", // Ebook
        "63ec21ad068777fbe9fbae33", //Blog
        "63ec21ad068777049bfbae30", //Webinar
        "63ec21ad0687771dfdfbae37", //Testimonial
        "63ec21ad068777c4effbae34", // Podcast
        "65b7e5130431d0de5583e361", // Tools
      ];
      const certifiedPartnerServiceTypesCollectionId =
        "64bec9d0d9be11ef02b7dab3";
      const certifiedPartnerCollectionId = "64bec95d1d0799a80325f918";
      const webinarModuleCollectionId = "65539140694b580e20191db8";
      const desiredOutcomeCollectionId = "65805a35ff9d32c0ce857ebc";
      const podcastSeriesCollectionId = "663cfaa2e757890c9cf72288";
      const webinarSeriesCollectionId = "663d08621b002de213bf35ba";

      const serviceTypes = await webflow.items({
        collectionId: certifiedPartnerServiceTypesCollectionId,
      });

      const webinarModuleMultiselect = await webflow.items({
        collectionId: webinarModuleCollectionId,
      });

      const desiredOutcomes = await webflow.items({
        collectionId: desiredOutcomeCollectionId,
      });

      const podcastSeriesList = await webflow.items({
        collectionId: podcastSeriesCollectionId,
      });

      const webinarSeriesList = await webflow.items({
        collectionId: webinarSeriesCollectionId,
      });

      serviceTypeList = [];
      for (const serviceType of serviceTypes) {
        serviceTypeIdNameMap[serviceType._id] = serviceType.name;
        serviceTypeList.push(serviceType.name);
      }

      for (const webinarModule of webinarModuleMultiselect) {
        webinarModuleNameMap[webinarModule._id] = webinarModule.name;
      }
      desiredOutcomesList = [];
      for (const desiredOutcome of desiredOutcomes) {
        desiredOutcomeNameMap[desiredOutcome._id] = desiredOutcome.name;
        desiredOutcomesList.push(desiredOutcome.name?.toLowerCase());
      }

      for (const podcastSeries of podcastSeriesList) {
        podcastSeriesNameMap[podcastSeries._id] = podcastSeries.name;
      }

      for (const webinarSeries of webinarSeriesList) {
        webinarSeriesNameMap[webinarSeries._id] = webinarSeries.name;
      }
      const certifiedPartners = await getCertifiedPartners(webflow);

      goldPartners = certifiedPartners
        .filter((partner) => partner.tier === "gold")
        .sort((partnerA, partnerB) => {
          return partnerA.order - partnerB.order;
        });
      diamondPartners = certifiedPartners
        .filter((partner) => partner.tier === "diamond")
        .sort((partnerA, partnerB) => {
          return partnerA.order - partnerB.order;
        });

      const tags = await webflow.items({
        collectionId: resourceTagCollectionId,
      });

      for (const tag of tags) {
        tagIdNameMap[tag._id] = tag.name;
      }

      const features = await webflow.items({
        collectionId: collectionIdMap.proofFeatures,
      });
      featureList = [];
      for (const feature of features) {
        featureIdNameMap[feature._id] = feature.name;
        featureList.push(feature);
      }
      for (const collectionId of collectionIds) {
        const items = await webflow.items({
          collectionId: collectionId,
        });
        // console.log(items);
        for (const item of items) {
          if (item?.name?.includes("3")) {
            console.log("@@@ item", item);
          }

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
      console.log(tagMap);

      const ebooks = await getEbooks(webflow);
      const webinars = await getWebinars(webflow);
      const blogs = await getBlogs(webflow);
      const podcasts = await getPodcasts(webflow);
      const testimonials = await getTestimonials(webflow);
      const productWebinars = await getProductWebinars(webflow);
      const tools = await getTools(webflow);
      const allContent = [
        ...ebooks,
        ...webinars,
        ...blogs,
        ...podcasts,
        ...testimonials,
        ...tools,
      ];
      const sortedContent = allContent.sort((a, b) => {
        return (
          moment(b.date).format("YYYYMMDD") - moment(a.date).format("YYYYMMDD")
        );
      });
      sortedResources = sortedContent.map((record) => {
        return {
          ...record,
          ...(record?.date != null && {
            date: moment(record.date).format("MMM D, YYYY"),
          }),
        };
      });
      const sortedProductWebinars = productWebinars.sort((a, b) => {
        return (
          moment(b.date).format("YYYYMMDD") - moment(a.date).format("YYYYMMDD")
        );
      });
      productWebinarList = sortedProductWebinars.map((record) => {
        return {
          ...record,
          ...(record?.date != null && {
            date: moment(record.date).format("MMM D, YYYY"),
          }),
        };
      });
      first6Resources = sortedResources.slice(0, 6);
    } catch (e) {
      // Deal with the fact the chain failed
      console.error(e);
    }
  }, 60000);
  // `text` is not available here
})();
