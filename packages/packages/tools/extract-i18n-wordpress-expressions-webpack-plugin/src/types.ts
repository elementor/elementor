import { type Chunk } from 'webpack';

export type EntrySettings = {
	id: string;
	chunk: Chunk;
	path: string;
	pattern: string;
};

export type TranslationCallExpression = {
	type: 'comment' | 'call-expression';
	index: number;
	value: string;
};
