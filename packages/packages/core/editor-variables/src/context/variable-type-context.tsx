import * as React from 'react';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import { type PropTypeKey } from '@elementor/editor-props';

import { type VariableTypesMap } from '../variables-registry/create-variable-type-registry';
import { getVariableType } from '../variables-registry/variable-type-registry';

type Props = PropsWithChildren< { propTypeKey: PropTypeKey } >;

type VariableTypeContextValue = VariableTypesMap[ string ] & {
	isUpgradeRequired: boolean;
};

const VariableTypeContext = createContext< VariableTypeContextValue | null >( null );

export function VariableTypeProvider( { children, propTypeKey }: Props ) {
	const variableType = getVariableType( propTypeKey );

	const contextValue = useMemo( () => {
		const isUpgradeRequired = ! window.elementorPro && ! variableType.valueField;

		return {
			...variableType,
			isUpgradeRequired,
		};
	}, [ variableType ] );

	return <VariableTypeContext.Provider value={ contextValue }>{ children }</VariableTypeContext.Provider>;
}

export function useVariableType() {
	const context = useContext( VariableTypeContext );

	if ( context === null ) {
		throw new Error( 'useVariableType must be used within a VariableTypeProvider' );
	}

	return context;
}
