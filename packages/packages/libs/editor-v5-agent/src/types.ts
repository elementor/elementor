import type { DocumentState, ElementNode } from '@elementor/editor-v5-store';

export type AgentTool = {
	name: string;
	description: string;
	inputSchema: Record< string, unknown >;
};

export type AgentEvent = {
	type: string;
	tool?: string;
	payload?: unknown;
	timestamp: number;
};

export type AgentSnapshot = {
	document: DocumentState;
	elements: ElementNode[];
	selectedIds: string[];
};

export type AgentEventListener = ( event: AgentEvent ) => void;
