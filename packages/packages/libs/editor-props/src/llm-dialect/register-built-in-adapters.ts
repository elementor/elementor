import { dynamicLlmDialectAdapter } from './adapters/dynamic';
import { htmlV3LlmDialectAdapter } from './adapters/html-v3';
import { imageSrcLlmDialectAdapter } from './adapters/image-src';
import { overridableLlmDialectAdapter } from './adapters/overridable';
import { sizeLlmDialectAdapter } from './adapters/size';
import { cleanupLlmJsonSchema } from './cleanup-llm-json-schema';
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
