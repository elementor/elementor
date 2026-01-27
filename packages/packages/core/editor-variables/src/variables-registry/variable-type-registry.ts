import {
	createVariableTypeRegistry,
	type MenuActionContext,
	type MenuActionsFactory,
	type VariableMenuAction,
} from './create-variable-type-registry';

export const { registerVariableType, getVariableType, getVariableTypes, hasVariableType } =
	createVariableTypeRegistry();

export function getMenuActionsForVariable(
	variableType: string,
	context: MenuActionContext
): VariableMenuAction[] {
	const typeOptions = getVariableType( variableType );
	if ( typeOptions?.menuActionsFactory ) {
		return typeOptions.menuActionsFactory( context );
	}
	return [];
}

export type { MenuActionContext, MenuActionsFactory, VariableMenuAction };
