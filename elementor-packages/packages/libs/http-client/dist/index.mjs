// src/http.ts
import axios from "axios";

// src/env.ts
import { parseEnv } from "@elementor/env";
var { env } = parseEnv("@elementor/http-client");

// src/http.ts
var instance;
var httpService = () => {
  if (!instance) {
    instance = axios.create({
      baseURL: env.base_url,
      timeout: 1e4,
      headers: {
        "Content-Type": "application/json",
        ...env.headers
      }
    });
  }
  return instance;
};
export {
  httpService
};
//# sourceMappingURL=index.mjs.map