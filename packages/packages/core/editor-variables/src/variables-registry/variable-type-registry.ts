import { createVariableTypeRegistry } from './create-variable-type-registry';

export const { registerVariableType, updateVariableType, getVariableType, getVariableTypes, hasVariableType } =
	createVariableTypeRegistry();
