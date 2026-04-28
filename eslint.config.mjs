import nextVitals from "eslint-config-next/core-web-vitals";

const config = [
  ...nextVitals,
  {
    ignores: [".next/**", "out/**", "dist/**", "legacy-build/**", "node_modules/**"],
  },
];

export default config;
