import { registerSchemaCleanupLlmDialectAdapter } from './cleanup-llm-json-schema';
import {
	type LlmDynamicTagMetadata,
	registerLlmDialectDynamicTags,
	setLlmDialectDynamicTagsResolver,
} from './dynamic-tag-metadata-registry';
import { registerDynamicPropTypeLLMDialectAdapter } from './register-dynamic-prop-type-llm-dialect-adapter';
import { registerHtmlV3LLMDialectAdapter } from './register-html-v3-llm-dialect-adapter';
import { registerSizeLLMDialectAdapter } from './register-size-llm-dialect-adapter';

export type { LlmDynamicTagMetadata };
export { registerLlmDialectDynamicTags, setLlmDialectDynamicTagsResolver };

export type InitLlmDialectOptions = {
	dynamicTags?: Record< string, LlmDynamicTagMetadata >;
	resolveDynamicTags?: () => Record< string, LlmDynamicTagMetadata > | undefined;
};

let initialized = false;

export const initLlmDialect = ( options: InitLlmDialectOptions = {} ) => {
	if ( options.resolveDynamicTags ) {
		setLlmDialectDynamicTagsResolver( options.resolveDynamicTags );
	}

	if ( options.dynamicTags ) {
		registerLlmDialectDynamicTags( options.dynamicTags );
	}

	if ( initialized ) {
		return;
	}
	registerDynamicPropTypeLLMDialectAdapter();
	registerHtmlV3LLMDialectAdapter();
	registerSizeLLMDialectAdapter();
	registerSchemaCleanupLlmDialectAdapter();
	initialized = true;
};
