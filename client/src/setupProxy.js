const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://localhost:5001",
      changeOrigin: true,
      secure: false,
      timeout: 60000,
      pathRewrite: {
        "^/api": "", // Remove the /api prefix since the server routes already include it
      },
      onError: (err, req, res) => {
        console.error("Proxy Error:", err);
        res.status(500).json({ error: "Proxy Error", details: err.message });
      },
    })
  );
};
