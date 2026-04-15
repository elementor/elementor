import { getSDK } from './utils/get-sdk';
export { getAngieIframe, MessageEventType as AngieMessageEvenetType } from './utils/get-sdk';

export {
	McpServer,
	ResourceTemplate,
	type RegisteredResource,
	type ToolCallback,
} from '@modelcontextprotocol/sdk/server/mcp.js';
export { SamplingMessageSchema } from '@modelcontextprotocol/sdk/types.js';
export { isAngieAvailable } from './utils/is-angie-available';
export { isAngieSidebarOpen } from './utils/is-angie-sidebar-open';
export * from './mcp-registry';
export { createSampler } from './sampler';
export { toolPrompts } from './utils/prompt-builder';
export { ANGIE_MODEL_PREFERENCES, type AngieModelPreferences } from './angie-annotations';
export { getActiveChatInfo, type ActiveChatInfo } from './utils/get-active-chat-info';
export { sendPromptToAngie } from './utils/send-prompt-to-angie';
export { redirectToInstallation } from './utils/redirect-to-installation';
export { redirectToAppAdmin } from './utils/redirect-to-app-admin';
export { installAngiePlugin, type InstallAngieResult } from './utils/install-angie-plugin';
export const getAngieSdk = () => getSDK();
export * from './init';
