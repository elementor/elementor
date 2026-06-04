import { dynamicLlmDialectAdapter } from './adapters/dynamic';
import { htmlV3LlmDialectAdapter } from './adapters/html-v3';
import { imageSrcLlmDialectAdapter } from './adapters/image-src';
import { overridableLlmDialectAdapter } from './adapters/overridable';
import { sizeLlmDialectAdapter } from './adapters/size';
import { cleanupLlmJsonSchema } from './cleanup-llm-json-schema';
import {
	type LlmDynamicTagMetadata,
	registerLlmDialectDynamicTags,
	setLlmDialectDynamicTagsResolver,
} from './dynamic-tag-metadata-registry';
import { registerLlmDialectAdapter, registerLlmDialectSchemaFinalize } from './registry';

const registerBuiltInLlmDialectAdapters = (): void => {
	registerLlmDialectAdapter( overridableLlmDialectAdapter );
	registerLlmDialectAdapter( dynamicLlmDialectAdapter );
	registerLlmDialectAdapter( htmlV3LlmDialectAdapter );
	registerLlmDialectAdapter( imageSrcLlmDialectAdapter );
	registerLlmDialectAdapter( sizeLlmDialectAdapter );
	registerLlmDialectSchemaFinalize( cleanupLlmJsonSchema );
};

let builtInAdaptersRegistered = false;

export const ensureBuiltInLlmDialectAdapters = (): void => {
	if ( builtInAdaptersRegistered ) {
		return;
	}

	registerBuiltInLlmDialectAdapters();
	builtInAdaptersRegistered = true;
};

export const resetBuiltInLlmDialectAdaptersForTests = (): void => {
	builtInAdaptersRegistered = false;
};

export type InitLlmDialectOptions = {
	dynamicTags?: Record< string, LlmDynamicTagMetadata >;
	resolveDynamicTags?: () => Record< string, LlmDynamicTagMetadata > | undefined;
};

export const initLlmDialect = ( options: InitLlmDialectOptions = {} ) => {
	ensureBuiltInLlmDialectAdapters();

	if ( options.resolveDynamicTags ) {
		setLlmDialectDynamicTagsResolver( options.resolveDynamicTags );
	}

	if ( options.dynamicTags ) {
		registerLlmDialectDynamicTags( options.dynamicTags );
	}
};
