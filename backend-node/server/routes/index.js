const express = require("express");
const { success, error } = require("../../internal/app/response");

/**
 * @param {number} start
 */
const collectTS = (start) => {
  return Date.now() - start;
};

/**
 *
 * @param {import("../usecase").UseCase} useCase
 */
const makeRouter = (useCase) => {
  const router = express.Router();

  router.get("/", function (req, res, next) {
    res.send("index");
  });

  router.get("/ping", function (req, res, next) {
    success(res, Date.now(), "noice");
  });

  router.get("/ingest-57", async (req, res, next) => {
    const start = Date.now();
    try {
      const requestID = req.query["id"] || "0";
      await useCase.ingestFile57("ingest-57-" + requestID);
      success(res, collectTS(start), {});
    } catch (err) {
      error(res, collectTS(start), 500, err);
    }
  });

  return router;
};

module.exports = { makeRouter };
