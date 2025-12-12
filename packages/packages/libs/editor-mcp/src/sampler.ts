import { type z } from '@elementor/schema';
import { type RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js';
import { SamplingMessageSchema, type ServerNotification, type ServerRequest } from '@modelcontextprotocol/sdk/types.js';

type Server = RequestHandlerExtra< ServerRequest, ServerNotification >;
type Opts = {
	maxTokens?: number;
	modelPreferences?: string;
	model?: string;
};

const DEFAULT_OPTS: Opts = {
	maxTokens: 10000,
	modelPreferences: 'openai',
	model: 'gpt-4o',
};

type SamplingOpts = {
	systemPrompt?: string;
	structuredOutput?: z.ZodTypeAny;
	messages: { role: 'user' | 'assistant'; content: { type: 'text'; text: string } }[];
	requestParams?: { [ key: string ]: string };
};

const DEFAULT_STRUCTURED_OUTPUT = {
	type: 'object',
	properties: {
		content: {
			type: 'string',
			description: 'Result',
		},
	},
	required: [ 'content' ],
	additionalProperties: false,
};

export const createSampler = ( server: Server, opts: Opts = DEFAULT_OPTS ) => {
	const { maxTokens = 1000, modelPreferences = 'openai', model = 'gpt-4o' } = opts;
	const exec = async ( payload: SamplingOpts ) => {
		const systemPromptObject = { ...( payload.systemPrompt ? { systemPrompt: payload.systemPrompt } : {} ) };
		const requestParams = payload.requestParams || {};
		const result = await server.sendRequest(
			{
				method: 'sampling/createMessage',
				params: {
					...requestParams,
					maxTokens,
					modelPreferences: {
						hints: [ { name: modelPreferences } ],
					},
					metadata: {
						model,
						...systemPromptObject,
						...{ structured_output: payload.structuredOutput || DEFAULT_STRUCTURED_OUTPUT },
					},
					messages: payload.messages,
				},
				// ...systemPromptObject,
			},
			SamplingMessageSchema
		);
		try {
			return JSON.parse( result.content.text as string );
		} catch {
			return result.content;
		}
	};
	return exec;
};
