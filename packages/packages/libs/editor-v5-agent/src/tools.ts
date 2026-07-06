import type { AgentTool } from './types';

const OBJECT_SCHEMA = { type: 'object' };
const STRING_SCHEMA = { type: 'string' };

export const AGENT_TOOLS: AgentTool[] = [
	{
		name: 'getSnapshot',
		description: 'Get the current editor snapshot.',
		inputSchema: {
			type: 'object',
			properties: {},
			additionalProperties: false,
		},
	},
	{
		name: 'listElements',
		description: 'List the full nested element tree.',
		inputSchema: {
			type: 'object',
			properties: {},
			additionalProperties: false,
		},
	},
	{
		name: 'getElement',
		description: 'Get a single element by id.',
		inputSchema: {
			type: 'object',
			properties: {
				id: STRING_SCHEMA,
			},
			required: [ 'id' ],
			additionalProperties: false,
		},
	},
	{
		name: 'listWidgets',
		description: 'List atomic widgets available in the catalog.',
		inputSchema: {
			type: 'object',
			properties: {},
			additionalProperties: false,
		},
	},
	{
		name: 'getWidgetSchema',
		description: 'Get the atomic props schema for a widget.',
		inputSchema: {
			type: 'object',
			properties: {
				name: STRING_SCHEMA,
			},
			required: [ 'name' ],
			additionalProperties: false,
		},
	},
	{
		name: 'createElement',
		description: 'Create a new element in the document tree.',
		inputSchema: {
			type: 'object',
			properties: {
				parentId: { type: [ 'string', 'null' ] },
				index: { type: 'number' },
				elType: STRING_SCHEMA,
				widgetType: STRING_SCHEMA,
				settings: OBJECT_SCHEMA,
			},
			required: [ 'elType' ],
			additionalProperties: false,
		},
	},
	{
		name: 'updateSetting',
		description: 'Update an element setting.',
		inputSchema: {
			type: 'object',
			properties: {
				id: STRING_SCHEMA,
				key: STRING_SCHEMA,
				value: {},
			},
			required: [ 'id', 'key' ],
			additionalProperties: false,
		},
	},
	{
		name: 'selectElement',
		description: 'Select one or more elements.',
		inputSchema: {
			type: 'object',
			properties: {
				ids: {
					type: 'array',
					items: STRING_SCHEMA,
				},
			},
			required: [ 'ids' ],
			additionalProperties: false,
		},
	},
	{
		name: 'removeElement',
		description: 'Remove an element from the document.',
		inputSchema: {
			type: 'object',
			properties: {
				id: STRING_SCHEMA,
			},
			required: [ 'id' ],
			additionalProperties: false,
		},
	},
	{
		name: 'moveElement',
		description: 'Move an element to a new parent and index in the nested tree.',
		inputSchema: {
			type: 'object',
			properties: {
				id: STRING_SCHEMA,
				parentId: { type: [ 'string', 'null' ] },
				index: { type: 'number' },
			},
			required: [ 'id', 'index' ],
			additionalProperties: false,
		},
	},
	{
		name: 'saveDocument',
		description: 'Save the current document.',
		inputSchema: {
			type: 'object',
			properties: {
				status: {
					type: 'string',
					enum: [ 'draft', 'publish', 'pending', 'private' ],
				},
			},
			additionalProperties: false,
		},
	},
];

export function getToolByName( name: string ): AgentTool | undefined {
	return AGENT_TOOLS.find( ( tool ) => tool.name === name );
}
