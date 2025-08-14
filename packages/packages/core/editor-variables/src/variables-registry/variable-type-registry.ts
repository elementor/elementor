import { type Variable } from '../types';
import { createVariableTypeRegistry } from './create-variable-type-registry';

export const { registerVariableType, getVariableType, hasVariableType } =
	createVariableTypeRegistry< Variable[ 'value' ] >();
