export { init } from './init';
export { GLOBAL_VARIABLES_URI } from './mcp/variables-resource';
export { sizeVariablePropTypeUtil } from './prop-types/size-variable-prop-type';
export { registerVariableTypes } from './register-variable-types';
export { service } from './service';
export {
	getMenuActionsForVariable,
	registerVariableType,
	type MenuActionContext,
	type MenuActionsFactory,
	type VariableManagerMenuAction,
} from './variables-registry/variable-type-registry';
export { hasVariable } from './hooks/use-prop-variables';

import { globalVariablesLLMResolvers } from './utils/llm-propvalue-label-resolver';

export const Utils = {
	globalVariablesLLMResolvers,
} as const;
