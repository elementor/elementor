import { getSDK } from './utils/get-sdk';

export {
	McpServer,
	ResourceTemplate,
	type RegisteredResource,
	type ToolCallback,
} from '@modelcontextprotocol/sdk/server/mcp.js';
export { SamplingMessageSchema } from '@modelcontextprotocol/sdk/types.js';
export { init } from './init';
export * from './mcp-registry';
export { createSampler } from './sampler';
export { toolPrompts } from './utils/prompt-builder';
export { ANGIE_MODEL_PREFERENCES, type AngieModelPreferences } from './angie-annotations';
export const getAngieSdk = () => getSDK();
