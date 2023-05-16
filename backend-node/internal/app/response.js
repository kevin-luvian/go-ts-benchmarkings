/**
 * @param {import('express').Response} res
 * @param {number} ts
 * @param {*} data
 */
const success = (res, ts, data) => {
  res.status(200).json({
    ok: true,
    msg: "success",
    data: data,
    ts: ts,
  });
};

/**
 * @param {import('express').Response} res
 * @param {number} ts
 * @param {number} code
 * @param {Error} err F
 */
const error = (res, ts, code, err) => {
  res.status(code).json({
    ok: false,
    msg: "error",
    data: err.message,
    ts: ts,
  });
};

module.exports = {
  success,
  error,
};
