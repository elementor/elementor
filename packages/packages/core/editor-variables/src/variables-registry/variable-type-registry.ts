import { createVariableTypeRegistry } from './create-variable-type-registry';

export const { registerVariableType, getVariableType, getVariableTypes, hasVariableType } =
	createVariableTypeRegistry();
