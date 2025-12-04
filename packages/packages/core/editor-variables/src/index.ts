export { init } from './init';
export { registerVariableTypes } from './register-variable-types';
export { service } from './service';
export { registerVariableType } from './variables-registry/variable-type-registry';

import { globalVariablesLLMResolvers } from './utils/llm-propvalue-label-resolver';

export const Utils = {
	globalVariablesLLMResolvers,
} as const;
