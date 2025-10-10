import * as React from 'react';
import { createContext, type Dispatch, type PropsWithChildren, useContext } from 'react';
import {
	type StyleDefinition,
	type StyleDefinitionID,
	type StyleDefinitionState,
	type StyleDefinitionVariant,
} from '@elementor/editor-styles';
import { type StylesProvider, stylesRepository, useUserStylesCapability } from '@elementor/editor-styles-repository';

import { StylesProviderNotFoundError } from '../errors';

type ContextValue = {
	setId: Dispatch< StyleDefinition[ 'id' ] | null >;
	meta: StyleDefinitionVariant[ 'meta' ];
	setMetaState: Dispatch< StyleDefinitionState >;
	canEdit?: boolean;
} & ( ContextValueWithProvider | ContextValueWithoutProvider );

type ContextValueWithProvider = {
	id: StyleDefinitionID;
	provider: StylesProvider;
};

type ContextValueWithoutProvider = {
	id: null;
	provider: null;
};

const Context = createContext< ContextValue | null >( null );

type Props = PropsWithChildren< Omit< ContextValue, 'provider' > >;

export function StyleProvider( { children, ...props }: Props ) {
	const provider = props.id === null ? null : getProviderByStyleId( props.id );

	const { userCan } = useUserStylesCapability();

	if ( props.id && ! provider ) {
		throw new StylesProviderNotFoundError( { context: { styleId: props.id } } );
	}

	const canEdit = userCan( provider?.getKey() ?? '' ).updateProps;

	return <Context.Provider value={ { ...props, provider, canEdit } as ContextValue }>{ children }</Context.Provider>;
}

export function useStyle() {
	const context = useContext( Context );

	if ( ! context ) {
		throw new Error( 'useStyle must be used within a StyleProvider' );
	}

	return context;
}

export function getProviderByStyleId( styleId: StyleDefinitionID ) {
	const styleProvider = stylesRepository.getProviders().find( ( provider ) => {
		return provider.actions.all().find( ( style ) => style.id === styleId );
	} );

	return styleProvider ?? null;
}

export function useIsStyle(): boolean {
	return !! useContext( Context );
}
