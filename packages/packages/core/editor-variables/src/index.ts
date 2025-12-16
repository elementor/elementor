export { init } from './init';
export { registerVariableTypes } from './register-variable-types';
export { sizeVariablePropTypeUtil } from './prop-types/size-variable-prop-type';
export { service } from './service';
export { registerVariableType } from './variables-registry/variable-type-registry';
export { GLOBAL_VARIABLES_URI } from './mcp/variables-resource';

import { globalVariablesLLMResolvers } from './utils/llm-propvalue-label-resolver';

export const Utils = {
	globalVariablesLLMResolvers,
} as const;
