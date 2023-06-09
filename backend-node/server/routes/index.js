const express = require("express");
const { success, error } = require("../../internal/app/response");
const { Server } = require("../../internal/settings");
const fs = require("fs");
const os = require("os");
const path = require("path");
const redis = require("../../internal/redis");
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

  router.get("/", function (req, res) {
    res.send("index");
  });

  router.get("/ping", function (req, res) {
    success(res, Date.now(), {
      "server-id": Server.id,
    });
  });

  router.get("/ingest-57", async (req, res) => {
    const start = Date.now();
    try {
      const requestID = req.query["id"];
      if (!requestID) {
        throw new Error("missing request-id");
      }

      const limit = req.query["limit"];
      if (!limit) {
        throw new Error("missing limit");
      }

      const fileName = "test_57_mb.xlsx";
      const sourcePath = path.join(useCase.testDir, fileName);
      safeRunDeez(sourcePath, requestID, async (filePath) => {
        await useCase.ingestFile(filePath, requestID, limit);
      });
      success(res, collectTS(start), {});
    } catch (err) {
      error(res, collectTS(start), 500, err);
    }
  });

  router.post("/panic", async (req, res) => {
    try {
      const panicCode = req.body["panic-code"];
      if (panicCode != "owo-benchmarker-panic") {
        throw new Error("invalid panic code");
      }

      redis.set("owo-node-panic", "true", 10000);
      success(res, 0, {
        msg: "panic triggered!!, file reads will fail for 10 seconds",
      });
    } catch (err) {
      error(res, 0, 500, err);
    }
  });

  return router;
};

/**
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
