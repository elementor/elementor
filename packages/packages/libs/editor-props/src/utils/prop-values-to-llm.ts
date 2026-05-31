import { type PropValue } from '../types';
import { applyDialectFromTree, ensureLlmDialect, type PropToLlmOptions } from './prop-values-llm-tree';

export type { PropToLlmOptions };

export const propValuesToLlm = ( value: Readonly< PropValue >, options: PropToLlmOptions = {} ): PropValue => {
	ensureLlmDialect();
	return applyDialectFromTree( value, options ) as PropValue;
};
