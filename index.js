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
const { setIntervalAsync } = require("set-interval-async");
const { WebflowClient } = require("webflow-api");
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
  .then(() => app.listen(port, () => console.log(`Listening on ${port}`)))
  .catch((err) => console.error(err));

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

app.get("/api/tags", async (req, res) => {
  return res.json(tagMap);
});

app.get("/api/resources/", async (req, res) => {
  if (req.query.type == null) {
    return res.json(sortedResources);
  }
  return res.json(
    sortedResources.filter((resource) => resource.contentType == req.query.type)
  );
});

app.get("/api/certified-partners/", async (req, res) => {
  return res.json({
    goldPartners,
    diamondPartners,
  });
});

app.get("/api/certified-partners/service-types", async (req, res) => {
  return res.json({
    serviceTypes: serviceTypeList,
  });
});

app.get("/api/resources/first-six", async (req, res) => {
  return res.json(first6Resources);
});

app.get("/api/product-webinars", async (req, res) => {
  return res.json(productWebinarList);
});

app.get("/api/product-webinars/module", async (req, res) => {
  return res.json(productWebinarNameAndModuleMap[req.query.name]);
});

app.get("/api/desired-outcomes", async (req, res) => {
  return res.json(desiredOutcomesList);
});

app.post("/api/check-demo-email", async (req, res) => {
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
  return "silver";
};

const getAllFromCollection = async (webflow, collectionId) => {
  let allItems = [];
  let offset = 0;
  const limit = 100; // Webflow API limit per request
  let hasMore = true;

  while (hasMore) {
    const response = await webflow.collections.items.listItems(collectionId, {
      limit,
      offset,
    });
    const items = response.items.map((item) => {
      return {
        ...item,
        _id: item.id,
        ...item.fieldData,
      };
    });
    allItems = allItems.concat(items);
    offset += items.length;
    hasMore = items.length === limit;
  }

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

  const webinars = webinarsResponse.map((webinar) => {
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
      module: "",
      desiredOutcomes: getDesiredOutcomes(webinar),
    };
    if (webinar?.["module-multiselect"] != null) {
      const modules = webinar["module-multiselect"].map((moduleId) => {
        return webinarModuleNameMap[moduleId];
      });
      result.module = modules.join(" ");
      productWebinarNameAndModuleMap[webinar?.name] = result.module;
    } else {
      productWebinarNameAndModuleMap[webinar?.name] = null;
    }
    return result;
  });
  console.log("@@@ product webinars", webinars);
  return webinars;
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
  return testimonials;
};

(async () => {
  setIntervalAsync(async () => {
    try {
      const apiKey = process.env.API_KEY_V2;
      const siteId = "6266d8ef8c92b1230d1e0cbb";
      const webflow = new WebflowClient({ accessToken: apiKey });

      const resourceTagCollectionId = "63ec21ad068777b053fbae35";

      const collectionsResponse = await webflow.collections.list(siteId);
      const collections = collectionsResponse;

      console.log(collections);

      const collectionIds = [
        "63ec21ad0687778cfffbae36", // Ebook
        "63ec21ad068777fbe9fbae33", // Blog
        "63ec21ad068777049bfbae30", // Webinar
        "63ec21ad0687771dfdfbae37", // Testimonial
        "63ec21ad068777c4effbae34", // Podcast
        "65b7e5130431d0de5583e361", // Tools
      ];
      const certifiedPartnerServiceTypesCollectionId =
        "64bec9d0d9be11ef02b7dab3";
      const webinarModuleCollectionId = "65539140694b580e20191db8";
      const desiredOutcomeCollectionId = "65805a35ff9d32c0ce857ebc";
      const podcastSeriesCollectionId = "663cfaa2e757890c9cf72288";
      const webinarSeriesCollectionId = "663d08621b002de213bf35ba";

      const serviceTypesResponse = await getAllFromCollection(
        webflow,
        certifiedPartnerServiceTypesCollectionId
      );
      const webinarModuleMultiselectResponse = await getAllFromCollection(
        webflow,
        webinarModuleCollectionId
      );
      const desiredOutcomesResponse = await getAllFromCollection(
        webflow,
        desiredOutcomeCollectionId
      );
      const podcastSeriesResponse = await getAllFromCollection(
        webflow,
        podcastSeriesCollectionId
      );
      const webinarSeriesResponse = await getAllFromCollection(
        webflow,
        webinarSeriesCollectionId
      );

      const serviceTypes = serviceTypesResponse;
      const webinarModuleMultiselect = webinarModuleMultiselectResponse;
      const desiredOutcomes = desiredOutcomesResponse;
      const podcastSeriesList = podcastSeriesResponse;
      const webinarSeriesList = webinarSeriesResponse;

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
        .filter(
          (partner) => partner.tier === "gold" || partner.tier === "silver"
        )
        .sort((partnerA, partnerB) => {
          return partnerA.order - partnerB.order;
        });
      diamondPartners = certifiedPartners
        .filter((partner) => partner.tier === "diamond")
        .sort((partnerA, partnerB) => {
          return partnerA.order - partnerB.order;
        });

      const tagsResponse = await getAllFromCollection(
        webflow,
        resourceTagCollectionId
      );
      const tags = tagsResponse;

      for (const tag of tags) {
        tagIdNameMap[tag._id] = tag.name;
      }

      const featuresResponse = await getAllFromCollection(
        webflow,
        collectionIdMap.proofFeatures
      );
      const features = featuresResponse;
      featureList = [];
      for (const feature of features) {
        featureIdNameMap[feature._id] = feature.name;
        featureList.push(feature);
      }
      for (const collectionId of collectionIds) {
        const itemsResponse = await getAllFromCollection(webflow, collectionId);
        const items = itemsResponse;
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
      // Handle errors
      console.error(e);
    }
  }, 60000);
})();
