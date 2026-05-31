import { LLMDialectAdapter } from '../llm-dialect/llm-prop-schema';
import { type PropValue } from '../types';
import { adjustLlmPropValueSchema } from './adjust-llm-prop-value-schema';
import { ensureLlmDialect } from './prop-values-llm-tree';

type PropConverter = ( value: unknown ) => PropValue;

export type PropFromLlmOptions = {
	forceKey?: string;
	transformers?: Record< string, PropConverter >;
};

export const propValuesFromLlm = ( value: Readonly< PropValue >, options: PropFromLlmOptions = {} ): PropValue => {
	ensureLlmDialect();
	const dialectConverted = LLMDialectAdapter.toPropValue( structuredClone( value ) ) as PropValue;
	return adjustLlmPropValueSchema( dialectConverted, options );
};
