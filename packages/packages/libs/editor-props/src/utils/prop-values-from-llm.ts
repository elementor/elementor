import { initLlmDialect as ensureLlmDialect } from '../llm-dialect/init';
import { walkPropValueWithPropType } from '../llm-dialect/walk';
import { type PropType, type PropValue } from '../types';
import { applyGlobalVariableResolvers, stripIntentionFromPropValue } from './adjust-llm-prop-value-schema';

type PropConverter = ( value: unknown ) => PropValue;

export type PropFromLlmOptions = {
	propType: PropType;
	transformers?: Record< string, PropConverter >;
};

export const propValuesFromLlm = ( value: Readonly< PropValue >, options: PropFromLlmOptions ): PropValue => {
	ensureLlmDialect();

	const walked = walkPropValueWithPropType( structuredClone( value ), options.propType, 'toProp' );
	const withoutIntention = stripIntentionFromPropValue( walked );

	return applyGlobalVariableResolvers( withoutIntention, options.transformers );
};
