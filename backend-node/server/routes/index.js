const express = require("express");
const { success, error } = require("../../internal/app/response");
const { Server } = require("../../internal/settings");
const fs = require("fs");
const os = require("os");
const path = require("path");
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
    success(res, Date.now(), {
      "server-id": Server.id,
    });
  });

  router.get("/ingest-57", async (req, res, next) => {
    const start = Date.now();
    try {
      const requestID = req.query["id"];
      if (!requestID) {
        throw new Error("missing request-id");
      }
      const fileName = "test_57_mb.xlsx";
      const sourcePath = path.join(useCase.testDir, fileName);
      safeRunDeez(sourcePath, requestID, async (filePath) => {
        await useCase.ingestFile(filePath, requestID);
      });
      success(res, collectTS(start), {});
    } catch (err) {
      error(res, collectTS(start), 500, err);
    }
  });

  return router;
};

/**
 *
 * @param {string} sourcePath
 * @param {string} requestID
 * @param {function(string):Promise<void>} runDeez
 */
const safeRunDeez = async (sourcePath, requestID, runDeez) => {
  const fileName = path.basename(sourcePath);
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), `temp-${requestID}-`));
  const targetPath = path.join(tempDir, fileName);
  fs.cpSync(sourcePath, targetPath);
  try {
    await runDeez(targetPath);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
};

module.exports = { makeRouter };
