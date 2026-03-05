// src/utils/get-sdk.ts
import { AngieMcpSdk } from "@elementor-external/angie-sdk";
var sdk;
var getSDK = () => {
  const isMCPDisabled = !!globalThis.__ELEMENTOR_MCP_DISABLED__;
  if (isMCPDisabled) {
    return {};
  }
  if (!sdk) {
    sdk = new AngieMcpSdk();
  }
  return sdk;
};

// src/index.ts
import { z as z2 } from "@elementor/schema";
import {
  McpServer as McpServer2,
  ResourceTemplate
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { SamplingMessageSchema as SamplingMessageSchema2 } from "@modelcontextprotocol/sdk/types.js";

// src/init.ts
import { isExperimentActive } from "@elementor/editor-v1-adapters";

// src/mcp-registry.ts
import { z } from "@elementor/schema";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// src/angie-annotations.ts
var ANGIE_MODEL_PREFERENCES = "angie/modelPreferences";

// src/test-utils/mock-mcp-registry.ts
var mock = new Proxy(
  {},
  {
    get: () => {
      function mockedFn(..._) {
      }
      return mockedFn;
    }
  }
);
var mockMcpRegistry = () => {
  return {
    // @ts-ignore
    resource: async () => {
    },
    // @ts-ignore
    sendResourceUpdated: () => {
    },
    addTool: () => {
    },
    setMCPDescription: () => {
    },
    getActiveChatInfo() {
      return { sessionId: "mock-session-id", expiresAt: Date.now() + 36e5 };
    },
    mcpServer: mock
  };
};

// src/mcp-registry.ts
var mcpRegistry = {};
var mcpDescriptions = {};
var isMcpRegistrationActivated = typeof globalThis.jest !== "undefined";
var registerMcp = (mcp, name) => {
  const mcpName = isAlphabet(name);
  mcpRegistry[mcpName] = mcp;
};
async function activateMcpRegistration(sdk2) {
  if (isMcpRegistrationActivated) {
    return;
  }
  isMcpRegistrationActivated = true;
  const mcpServerList = Object.entries(mcpRegistry);
  for await (const entry of mcpServerList) {
    const [key, mcpServer] = entry;
    await sdk2.registerLocalServer({
      name: `editor-${key}`,
      server: mcpServer,
      version: "1.0.0",
      description: mcpDescriptions[key] || key
    });
  }
}
var isAlphabet = (str) => {
  const passes = !!str && /^[a-z_]+$/.test(str);
  if (!passes) {
    throw new Error("Not alphabet");
  }
  return str;
};
var getMCPByDomain = (namespace, options) => {
  const mcpName = `editor-${isAlphabet(namespace)}`;
  if (typeof globalThis.jest !== "undefined") {
    return mockMcpRegistry();
  }
  if (!mcpRegistry[namespace]) {
    mcpRegistry[namespace] = new McpServer(
      {
        name: mcpName,
        version: "1.0.0"
      },
      {
        instructions: options?.instructions
      }
    );
  }
  const mcpServer = mcpRegistry[namespace];
  const { addTool } = createToolRegistry(mcpServer);
  return {
    waitForReady: () => getSDK().waitForReady(),
    // @ts-expect-error: TS is unable to infer the type here
    resource: async (...args) => {
      await getSDK().waitForReady();
      return mcpServer.resource(...args);
    },
    sendResourceUpdated: (...args) => {
      return new Promise(async () => {
        await getSDK().waitForReady();
        mcpServer.server.sendResourceUpdated(...args);
      });
    },
    mcpServer,
    addTool,
    setMCPDescription: (description) => {
      mcpDescriptions[namespace] = description;
    },
    getActiveChatInfo: () => {
      const info = localStorage.getItem("angie_active_chat_id");
      if (!info) {
        return {
          expiresAt: 0,
          sessionId: ""
        };
      }
      const rawData = JSON.parse(info);
      return {
        expiresAt: rawData.expiresAt,
        sessionId: rawData.sessionId
      };
    }
  };
};
function createToolRegistry(server) {
  function addTool(opts) {
    const outputSchema = opts.outputSchema;
    if (outputSchema) {
      Object.assign(
        outputSchema,
        outputSchema.errors ?? {
          errors: z.string().optional().describe("Error message if the tool failed")
        }
      );
    }
    const inputSchema = opts.schema ? opts.schema : {};
    const toolCallback = async function(args, extra) {
      try {
        const invocationResult = await opts.handler(opts.schema ? args : {}, extra);
        return {
          // TODO: Uncomment this when the outputSchema is stable
          // structuredContent: typeof invocationResult === 'string' ? undefined : invocationResult,
          content: [
            {
              type: "text",
              text: typeof invocationResult === "string" ? invocationResult : JSON.stringify(invocationResult)
            }
          ]
        };
      } catch (error) {
        return {
          isError: true,
          structuredContent: {
            errors: error.message || "Unknown error"
          },
          content: [
            {
              type: "text",
              text: error.message || "Unknown error"
            }
          ]
        };
      }
    };
    const annotations = {
      destructiveHint: opts.isDestructive,
      readOnlyHint: opts.isDestructive ? false : void 0,
      title: opts.name
    };
    if (opts.requiredResources) {
      annotations["angie/requiredResources"] = opts.requiredResources;
    }
    if (opts.modelPreferences) {
      annotations[ANGIE_MODEL_PREFERENCES] = opts.modelPreferences;
    }
    server.registerTool(
      opts.name,
      {
        description: opts.description,
        inputSchema,
        // TODO: Uncomment this when the outputSchema is stable
        // outputSchema,
        title: opts.name,
        annotations
      },
      toolCallback
    );
    if (isMcpRegistrationActivated) {
      server.sendToolListChanged();
    }
  }
  return {
    addTool
  };
}

// src/utils/is-angie-available.ts
import { getAngieIframe } from "@elementor-external/angie-sdk";
var isAngieAvailable = () => {
  return !!getAngieIframe();
};

// src/init.ts
function init() {
  if (isExperimentActive("editor_mcp") && isAngieAvailable()) {
    return getSDK().waitForReady();
  }
  return Promise.resolve();
}
function startMCPServer() {
  if (isExperimentActive("editor_mcp") && isAngieAvailable()) {
    const sdk2 = getSDK();
    sdk2.waitForReady().then(() => activateMcpRegistration(sdk2));
  }
  return Promise.resolve();
}
document.addEventListener(
  "DOMContentLoaded",
  () => {
    startMCPServer();
  },
  {
    once: true
  }
);

// src/sampler.ts
import { SamplingMessageSchema } from "@modelcontextprotocol/sdk/types.js";
var DEFAULT_OPTS = {
  maxTokens: 1e4,
  modelPreferences: "openai",
  model: "gpt-4o"
};
var DEFAULT_STRUCTURED_OUTPUT = {
  type: "object",
  properties: {
    content: {
      type: "string",
      description: "Result"
    }
  },
  required: ["content"],
  additionalProperties: false
};
var createSampler = (server, opts = DEFAULT_OPTS) => {
  const { maxTokens = 1e3, modelPreferences = "openai", model = "gpt-4o" } = opts;
  const exec = async (payload) => {
    const systemPromptObject = { ...payload.systemPrompt ? { systemPrompt: payload.systemPrompt } : {} };
    const requestParams = payload.requestParams || {};
    const result = await server.sendRequest(
      {
        method: "sampling/createMessage",
        params: {
          ...requestParams,
          maxTokens,
          modelPreferences: {
            hints: [{ name: modelPreferences }]
          },
          metadata: {
            model,
            ...systemPromptObject,
            ...{ structured_output: payload.structuredOutput || DEFAULT_STRUCTURED_OUTPUT }
          },
          messages: payload.messages
        }
        // ...systemPromptObject,
      },
      SamplingMessageSchema
    );
    return result.content;
  };
  return exec;
};

// src/utils/prompt-builder.ts
var ToolPrompts = class {
  constructor(name) {
    this.name = name;
  }
  _description = "";
  _parameters = {};
  _examples = [];
  _furtherInstructions = [];
  description(desc) {
    if (typeof desc === "undefined") {
      return this._description;
    }
    this._description = desc;
    return this;
  }
  parameter(key, description) {
    if (typeof description === "undefined") {
      return this._parameters[key];
    }
    this._parameters[key] = `**${key}**:
${description}`;
    return this;
  }
  instruction(instruction) {
    this._furtherInstructions.push(instruction);
    return this;
  }
  example(example) {
    this._examples.push(example);
    return this;
  }
  get examples() {
    return this._examples.join("\n\n");
  }
  prompt() {
    return `# ${this.name}
# Description
${this._description}

${this._parameters.length ? "# Parameters" : ""}
${Object.values(this._parameters).join("\n\n")}

${this._examples.length ? "# Examples" : ""}
${this.examples}

${this._furtherInstructions.length ? "# Further Instructions" : ""}
${this._furtherInstructions.join("\n\n")}
`.trim();
  }
};
var toolPrompts = (name) => {
  return new ToolPrompts(name);
};

// src/index.ts
var getAngieSdk = () => getSDK();
export {
  ANGIE_MODEL_PREFERENCES,
  McpServer2 as McpServer,
  ResourceTemplate,
  SamplingMessageSchema2 as SamplingMessageSchema,
  activateMcpRegistration,
  createSampler,
  getAngieSdk,
  getMCPByDomain,
  init,
  isAngieAvailable,
  registerMcp,
  toolPrompts,
  z2 as zod
};
//# sourceMappingURL=index.mjs.map