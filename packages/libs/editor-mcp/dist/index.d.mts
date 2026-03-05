import { type z } from '@elementor/schema';
import type * as _elementor_external_angie_sdk from '@elementor-external/angie-sdk';
import { type AngieMcpSdk } from '@elementor-external/angie-sdk';
export { z as zod } from '@elementor/schema';
import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
export { McpServer, RegisteredResource, ResourceTemplate, ToolCallback } from '@modelcontextprotocol/sdk/server/mcp.js';
import { type ServerNotification, type ServerRequest } from '@modelcontextprotocol/sdk/types.js';
export { SamplingMessageSchema } from '@modelcontextprotocol/sdk/types.js';
import { type RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js';

declare function init(): Promise<void>;

declare const isAngieAvailable: () => boolean;

declare const ANGIE_MODEL_PREFERENCES: 'angie/modelPreferences';
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
declare const getMCPByDomain: (
	namespace: string,
	options?: {
		instructions?: string;
	}
) => MCPRegistryEntry;
interface MCPRegistryEntry {
	addTool: <T extends undefined | z.ZodRawShape = undefined, O extends undefined | z.ZodRawShape = undefined>(
		opts: ToolRegistrationOptions<T, O>
	) => void;
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
type ToolRegistrationOptions<
	InputArgs extends undefined | z.ZodRawShape = undefined,
	OutputSchema extends undefined | z.ZodRawShape = undefined,
	ExpectedOutput = OutputSchema extends z.ZodRawShape ? z.objectOutputType<OutputSchema, z.ZodTypeAny> : string,
> = {
	name: string;
	description: string;
	schema?: InputArgs;
	/**
	 * Auto added fields:
	 * @param errors z.string().optional().describe('Error message if the tool failed')
	 */
	outputSchema?: OutputSchema;
	handler: InputArgs extends z.ZodRawShape
		? (
				args: z.objectOutputType<InputArgs, z.ZodTypeAny>,
				extra: RequestHandlerExtra<ServerRequest, ServerNotification>
			) => ExpectedOutput | Promise<ExpectedOutput>
		: (
				args: unknown,
				extra: RequestHandlerExtra<ServerRequest, ServerNotification>
			) => ExpectedOutput | Promise<ExpectedOutput>;
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
declare const createSampler: (
	server: Server,
	opts?: Opts
) => (payload: SamplingOpts) => Promise<
	| {
			type: 'text';
			text: string;
			annotations?:
				| {
						audience?: ('user' | 'assistant')[] | undefined;
						priority?: number | undefined;
						lastModified?: string | undefined;
				  }
				| undefined;
			_meta?: Record<string, unknown> | undefined;
	  }
	| {
			type: 'image';
			data: string;
			mimeType: string;
			annotations?:
				| {
						audience?: ('user' | 'assistant')[] | undefined;
						priority?: number | undefined;
						lastModified?: string | undefined;
				  }
				| undefined;
			_meta?: Record<string, unknown> | undefined;
	  }
	| {
			type: 'audio';
			data: string;
			mimeType: string;
			annotations?:
				| {
						audience?: ('user' | 'assistant')[] | undefined;
						priority?: number | undefined;
						lastModified?: string | undefined;
				  }
				| undefined;
			_meta?: Record<string, unknown> | undefined;
	  }
	| {
			type: 'tool_use';
			name: string;
			id: string;
			input: Record<string, unknown>;
			_meta?: Record<string, unknown> | undefined;
	  }
	| {
			type: 'tool_result';
			toolUseId: string;
			content: (
				| {
						type: 'text';
						text: string;
						annotations?:
							| {
									audience?: ('user' | 'assistant')[] | undefined;
									priority?: number | undefined;
									lastModified?: string | undefined;
							  }
							| undefined;
						_meta?: Record<string, unknown> | undefined;
				  }
				| {
						type: 'image';
						data: string;
						mimeType: string;
						annotations?:
							| {
									audience?: ('user' | 'assistant')[] | undefined;
									priority?: number | undefined;
									lastModified?: string | undefined;
							  }
							| undefined;
						_meta?: Record<string, unknown> | undefined;
				  }
				| {
						type: 'audio';
						data: string;
						mimeType: string;
						annotations?:
							| {
									audience?: ('user' | 'assistant')[] | undefined;
									priority?: number | undefined;
									lastModified?: string | undefined;
							  }
							| undefined;
						_meta?: Record<string, unknown> | undefined;
				  }
				| {
						uri: string;
						name: string;
						type: 'resource_link';
						description?: string | undefined;
						mimeType?: string | undefined;
						annotations?:
							| {
									audience?: ('user' | 'assistant')[] | undefined;
									priority?: number | undefined;
									lastModified?: string | undefined;
							  }
							| undefined;
						_meta?:
							| {
									[x: string]: unknown;
							  }
							| undefined;
						icons?:
							| {
									src: string;
									mimeType?: string | undefined;
									sizes?: string[] | undefined;
									theme?: 'light' | 'dark' | undefined;
							  }[]
							| undefined;
						title?: string | undefined;
				  }
				| {
						type: 'resource';
						resource:
							| {
									uri: string;
									text: string;
									mimeType?: string | undefined;
									_meta?: Record<string, unknown> | undefined;
							  }
							| {
									uri: string;
									blob: string;
									mimeType?: string | undefined;
									_meta?: Record<string, unknown> | undefined;
							  };
						annotations?:
							| {
									audience?: ('user' | 'assistant')[] | undefined;
									priority?: number | undefined;
									lastModified?: string | undefined;
							  }
							| undefined;
						_meta?: Record<string, unknown> | undefined;
				  }
			)[];
			structuredContent?:
				| {
						[x: string]: unknown;
				  }
				| undefined;
			isError?: boolean | undefined;
			_meta?: Record<string, unknown> | undefined;
	  }
	| (
			| {
					type: 'text';
					text: string;
					annotations?:
						| {
								audience?: ('user' | 'assistant')[] | undefined;
								priority?: number | undefined;
								lastModified?: string | undefined;
						  }
						| undefined;
					_meta?: Record<string, unknown> | undefined;
			  }
			| {
					type: 'image';
					data: string;
					mimeType: string;
					annotations?:
						| {
								audience?: ('user' | 'assistant')[] | undefined;
								priority?: number | undefined;
								lastModified?: string | undefined;
						  }
						| undefined;
					_meta?: Record<string, unknown> | undefined;
			  }
			| {
					type: 'audio';
					data: string;
					mimeType: string;
					annotations?:
						| {
								audience?: ('user' | 'assistant')[] | undefined;
								priority?: number | undefined;
								lastModified?: string | undefined;
						  }
						| undefined;
					_meta?: Record<string, unknown> | undefined;
			  }
			| {
					type: 'tool_use';
					name: string;
					id: string;
					input: Record<string, unknown>;
					_meta?: Record<string, unknown> | undefined;
			  }
			| {
					type: 'tool_result';
					toolUseId: string;
					content: (
						| {
								type: 'text';
								text: string;
								annotations?:
									| {
											audience?: ('user' | 'assistant')[] | undefined;
											priority?: number | undefined;
											lastModified?: string | undefined;
									  }
									| undefined;
								_meta?: Record<string, unknown> | undefined;
						  }
						| {
								type: 'image';
								data: string;
								mimeType: string;
								annotations?:
									| {
											audience?: ('user' | 'assistant')[] | undefined;
											priority?: number | undefined;
											lastModified?: string | undefined;
									  }
									| undefined;
								_meta?: Record<string, unknown> | undefined;
						  }
						| {
								type: 'audio';
								data: string;
								mimeType: string;
								annotations?:
									| {
											audience?: ('user' | 'assistant')[] | undefined;
											priority?: number | undefined;
											lastModified?: string | undefined;
									  }
									| undefined;
								_meta?: Record<string, unknown> | undefined;
						  }
						| {
								uri: string;
								name: string;
								type: 'resource_link';
								description?: string | undefined;
								mimeType?: string | undefined;
								annotations?:
									| {
											audience?: ('user' | 'assistant')[] | undefined;
											priority?: number | undefined;
											lastModified?: string | undefined;
									  }
									| undefined;
								_meta?:
									| {
											[x: string]: unknown;
									  }
									| undefined;
								icons?:
									| {
											src: string;
											mimeType?: string | undefined;
											sizes?: string[] | undefined;
											theme?: 'light' | 'dark' | undefined;
									  }[]
									| undefined;
								title?: string | undefined;
						  }
						| {
								type: 'resource';
								resource:
									| {
											uri: string;
											text: string;
											mimeType?: string | undefined;
											_meta?: Record<string, unknown> | undefined;
									  }
									| {
											uri: string;
											blob: string;
											mimeType?: string | undefined;
											_meta?: Record<string, unknown> | undefined;
									  };
								annotations?:
									| {
											audience?: ('user' | 'assistant')[] | undefined;
											priority?: number | undefined;
											lastModified?: string | undefined;
									  }
									| undefined;
								_meta?: Record<string, unknown> | undefined;
						  }
					)[];
					structuredContent?:
						| {
								[x: string]: unknown;
						  }
						| undefined;
					isError?: boolean | undefined;
					_meta?: Record<string, unknown> | undefined;
			  }
	  )[]
>;

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

export {
	ANGIE_MODEL_PREFERENCES,
	type AngieModelPreferences,
	type MCPRegistryEntry,
	activateMcpRegistration,
	createSampler,
	getAngieSdk,
	getMCPByDomain,
	init,
	isAngieAvailable,
	registerMcp,
	toolPrompts,
};
