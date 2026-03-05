import { type VariableManagerMenuAction } from '../components/variables-manager/ui/variable-edit-menu';
import {
	createVariableTypeRegistry,
	type MenuActionContext,
	type MenuActionsFactory,
} from './create-variable-type-registry';

export const { registerVariableType, getVariableType, getVariableTypes, hasVariableType } =
	createVariableTypeRegistry();

export function getMenuActionsForVariable(
	variableType: string,
	context: MenuActionContext
): VariableManagerMenuAction[] {
	const typeOptions = getVariableType( variableType );
	if ( typeOptions?.menuActionsFactory ) {
		return typeOptions.menuActionsFactory( context );
	}
	return [];
}

export type { MenuActionContext, MenuActionsFactory, VariableManagerMenuAction };
