import { initLlmDialect as ensureLlmDialect } from '../llm-dialect/init';
import { walkPropValueWithPropType } from '../llm-dialect/walk';
import { type PropType, type PropValue } from '../types';

export type PropToLlmOptions = {
	propType: PropType;
};

export const propValuesToLlm = ( value: Readonly< PropValue >, options: PropToLlmOptions ): PropValue => {
	ensureLlmDialect();
	return walkPropValueWithPropType( structuredClone( value ), options.propType, 'toDialect' );
};
