export { init } from './init';
export { GLOBAL_VARIABLES_URI } from './mcp/variables-resource';
export { sizeVariablePropTypeUtil } from './prop-types/size-variable-prop-type';
export { registerVariableTypes } from './register-variable-types';
export { service } from './service';
export { registerVariableType } from './variables-registry/variable-type-registry';

import { globalVariablesLLMResolvers } from './utils/llm-propvalue-label-resolver';

export const Utils = {
	globalVariablesLLMResolvers,
} as const;
