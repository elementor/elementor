import * as React from 'react';
import { createContext, type PropsWithChildren, useContext } from 'react';
import { type PropTypeKey } from '@elementor/editor-props';

import { getVariableType } from '../variables-registry/variable-type-registry';

type Props = PropsWithChildren< { propTypeKey: PropTypeKey } >;

const VariableTypeContext = createContext< PropTypeKey | null >( null );

export function VariableTypeProvider( { children, propTypeKey }: Props ) {
	return <VariableTypeContext.Provider value={ propTypeKey }>{ children }</VariableTypeContext.Provider>;
}

export function useVariableType() {
	const context = useContext( VariableTypeContext );

	if ( context === null ) {
		throw new Error( 'useVariableType must be used within a VariableTypeProvider' );
	}

	return getVariableType( context );
}
