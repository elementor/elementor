import * as React from 'react';
import { createContext, type Dispatch, type PropsWithChildren, useContext, useEffect } from 'react';
import {
	type StyleDefinition,
	type StyleDefinitionID,
	type StyleDefinitionState,
	type StyleDefinitionVariant,
} from '@elementor/editor-styles';
import {
	isElementsStylesProvider,
	type StylesProvider,
	stylesRepository,
	useUserStylesCapability,
} from '@elementor/editor-styles-repository';
import { setAppliedClassContext } from '@elementor/editor-variables';

import { StylesProviderNotFoundError } from '../errors';

const LOCAL_APPLIED_CLASS = 'local';

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

	useEffect( () => {
		setAppliedClassContext( resolveAppliedClassLabel( props.id, provider ) );

		return () => setAppliedClassContext( null );
	}, [ props.id, provider ] );

	return <Context.Provider value={ { ...props, provider, canEdit } as ContextValue }>{ children }</Context.Provider>;
}

function resolveAppliedClassLabel(
	id: StyleDefinition[ 'id' ] | null,
	provider: StylesProvider | null
): string | null {
	if ( ! id || ! provider || isElementsStylesProvider( provider.getKey() ) ) {
		return LOCAL_APPLIED_CLASS;
	}

	return provider.actions.get( id )?.label ?? null;
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
