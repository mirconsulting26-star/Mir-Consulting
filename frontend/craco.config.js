// craco.config.js — host-agnostic CRA + Tailwind build config
const path = require("path");
require("dotenv").config();

module.exports = {
  eslint: {
    configure: {
      extends: ["plugin:react-hooks/recommended"],
      rules: {
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "warn",
      },
    },
  },
  webpack: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
    configure: (webpackConfig) => {
      // Reduce file-watcher noise in dev.
      webpackConfig.watchOptions = {
        ...webpackConfig.watchOptions,
        ignored: [
          "**/node_modules/**",
          "**/.git/**",
          "**/build/**",
          "**/dist/**",
          "**/coverage/**",
          "**/public/**",
        ],
      };

      // Strip ForkTsCheckerWebpackPlugin — this codebase is pure JavaScript and the
      // plugin pulls in a fragile schema-utils/ajv-keywords combo that breaks on
      // fresh npm installs (e.g. Render/Vercel). Safe to remove since no .ts/.tsx
      // files exist.
      webpackConfig.plugins = (webpackConfig.plugins || []).filter(
        (p) =>
          p &&
          p.constructor &&
          p.constructor.name !== "ForkTsCheckerWebpackPlugin"
      );

      return webpackConfig;
    },
  },
};
