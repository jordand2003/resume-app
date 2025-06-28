const { createProxyMiddleware } = require("http-proxy-middleware");

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: API_URL,
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
