const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://localhost:8000",
      changeOrigin: true,
      secure: false,
      timeout: 60000,
      pathRewrite: {
        "^/api": "/api", // Keep the /api prefix when forwarding to the server
      },
      onError: (err, req, res) => {
        console.error("Proxy Error:", err);
        res.status(500).json({ error: "Proxy Error", details: err.message });
      },
    })
  );
};
