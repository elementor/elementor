import * as _elementor_external_angie_sdk from '@elementor-external/angie-sdk';
import { AngieMcpSdk } from '@elementor-external/angie-sdk';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
export { McpServer, RegisteredResource, ResourceTemplate, ToolCallback } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ServerRequest, ServerNotification } from '@modelcontextprotocol/sdk/types.js';
export { SamplingMessageSchema } from '@modelcontextprotocol/sdk/types.js';
import { z } from '@elementor/schema';
import { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js';

declare function init(): Promise<void>;

declare const isAngieAvailable: () => boolean;

declare const ANGIE_MODEL_PREFERENCES: "angie/modelPreferences";
interface AngieModelPreferences {
    hints?: Array<{
        name: string;
    }>;
    costPriority?: number;
    speedPriority?: number;
    intelligencePriority?: number;
}

declare const registerMcp: (mcp: McpServer, name: string) => void;
declare function activateMcpRegistration(sdk: AngieMcpSdk): Promise<void>;
/**
 *
 * @param namespace            The namespace of the MCP server. It should contain only lowercase alphabetic characters.
 * @param options
 * @param options.instructions
 */
declare const getMCPByDomain: (namespace: string, options?: {
    instructions?: string;
}) => MCPRegistryEntry;
interface MCPRegistryEntry {
    addTool: <T extends undefined | z.ZodRawShape = undefined, O extends undefined | z.ZodRawShape = undefined>(opts: ToolRegistrationOptions<T, O>) => void;
    setMCPDescription: (description: string) => void;
    getActiveChatInfo: () => {
        sessionId: string;
        expiresAt: number;
    };
    sendResourceUpdated: McpServer['server']['sendResourceUpdated'];
    resource: McpServer['resource'];
    mcpServer: McpServer;
    waitForReady: () => Promise<void>;
}
type ResourceList = {
    uri: string;
    description: string;
}[];
type ToolRegistrationOptions<InputArgs extends undefined | z.ZodRawShape = undefined, OutputSchema extends undefined | z.ZodRawShape = undefined, ExpectedOutput = OutputSchema extends z.ZodRawShape ? z.objectOutputType<OutputSchema, z.ZodTypeAny> : string> = {
    name: string;
    description: string;
    schema?: InputArgs;
    /**
     * Auto added fields:
     * @param errors z.string().optional().describe('Error message if the tool failed')
     */
    outputSchema?: OutputSchema;
    handler: InputArgs extends z.ZodRawShape ? (args: z.objectOutputType<InputArgs, z.ZodTypeAny>, extra: RequestHandlerExtra<ServerRequest, ServerNotification>) => ExpectedOutput | Promise<ExpectedOutput> : (args: unknown, extra: RequestHandlerExtra<ServerRequest, ServerNotification>) => ExpectedOutput | Promise<ExpectedOutput>;
    isDestructive?: boolean;
    requiredResources?: ResourceList;
    modelPreferences?: AngieModelPreferences;
};

type Server = RequestHandlerExtra<ServerRequest, ServerNotification>;
type Opts = {
    maxTokens?: number;
    modelPreferences?: string;
    model?: string;
};
type SamplingOpts = {
    systemPrompt?: string;
    structuredOutput?: z.ZodTypeAny;
    messages: {
        role: 'user' | 'assistant';
        content: {
            type: 'text';
            text: string;
        };
    }[];
    requestParams?: {
        [key: string]: string;
    };
};
declare const createSampler: (server: Server, opts?: Opts) => (payload: SamplingOpts) => Promise<any>;

declare class ToolPrompts {
    name: string;
    _description: string;
    _parameters: Record<string, string>;
    _examples: string[];
    _furtherInstructions: string[];
    constructor(name: string);
    description(): string;
    description(desc: string): this;
    parameter(key: string): string;
    parameter(key: string, description: string): this;
    instruction(instruction: string): this;
    example(example: string): this;
    get examples(): string;
    prompt(): string;
}
declare const toolPrompts: (name: string) => ToolPrompts;

declare const getAngieSdk: () => _elementor_external_angie_sdk.AngieMcpSdk;

export { ANGIE_MODEL_PREFERENCES, type AngieModelPreferences, type MCPRegistryEntry, activateMcpRegistration, createSampler, getAngieSdk, getMCPByDomain, init, isAngieAvailable, registerMcp, toolPrompts };
