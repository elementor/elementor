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
		const result = await server.sendRequest(
			{
				method: 'sampling/createMessage',
				params: {
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

const x = {
	timestamp: 1759246047491,
	metadata: {
		finalResponse: {
			id: 'chatcmpl-CLWY9iTdCg4wMJ4kcn026znPAB5se',
			choices: [
				{
					index: 0,
					finish_reason: 'tool_calls',
					logprobs: null,
					message: {
						role: 'assistant',
						content: null,
						refusal: null,
						tool_calls: [
							{
								id: 'call_K4VXxXjR1OmmDemgyjDn4x1i',
								type: 'function',
								function: {
									name: 'editor-canvas__build-html',
									arguments:
										"{\"userRequirements\":\"Create a hero section with a headline titled 'Innovate Your Future', a subtitle 'Leading the Way in Technology Solutions', a main text that elaborates on innovation and future goals within the tech industry, and two call-to-action buttons labeled 'Learn More' and 'Get Started'. Utilize relevant Elementor widgets and styles to fit into current page settings, preferences, and design aesthetics.\"}",
									parsed_arguments: null,
								},
								progressState: 'Generating',
							},
						],
						parsed: null,
					},
				},
			],
			created: 1759246045,
			requiresPageReload: false,
			userRequestId: 'user-req-b23b9c85-8c0f-410b-89fe-f30b9d17b642',
			usage: {
				hasAiSubscription: true,
				usedQuota: 700,
				quota: 900,
				usagePercentage: 78,
				shouldShowWarning: true,
				warningThreshold: 75,
				isBlocking: false,
				userType: 'trial',
			},
		},
		requiresPageReload: false,
	},
};
