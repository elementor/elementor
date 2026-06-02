import {
	type LlmDynamicTagMetadata,
	registerLlmDialectDynamicTags,
	setLlmDialectDynamicTagsResolver,
} from './dynamic-tag-metadata-registry';
import { ensureBuiltInLlmDialectAdapters } from './register-built-in-adapters';

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

export const ensureLlmDialect = () => {
	initLlmDialect();
};
