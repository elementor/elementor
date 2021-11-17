import { createContext, useContextSelector } from 'use-context-selector';
import { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { useMemo } from "elementor/tmp/wordpress/wp-includes/js/dist/vendor/react";

const ElementsContext = createContext( {} );

export function useElementsContext( elementId ) {
	const model = useContextSelector(
		ElementsContext,
		( [ get ] ) => elementId ? get[ elementId ] : get
	);

	const titleEdit = useCallback( ( title ) => {
		const settings = model.get( 'settings' );

		settings.set( '_title', title.trim() );

		$e.internal( 'document/save/set-is-modified', {
			status: true,
		} );
	}, [ model ] );

	const hasChildren = () => 'widget' !== model.get( 'elType' ) ||
		Boolean( model.get( 'elements' ).length );

	const toggleVisibility = () => model.trigger( 'request:toggleVisibility' );

	const showContextMenu = ( e ) => model.trigger( 'request:contextmenu', e );

	const toggleSelection = ( { append = false } ) => {
		elementor.getContainer( elementId ).model
			.trigger( 'request:edit', {
				append,
				scrollIntoView: true,
			} );
	};

	return {
		element: serializeModel( model ),
		toggleVisibility,
		titleEdit,
		hasChildren,
		selected,
		showContextMenu,
		toggleSelection,
	};
}

export function ElementsProvider( { children } ) {
	const state = $e.states.get( 'document/elements', 'elements' ),
		[ , forceUpdate ] = useReducer( () => {} );

	state.subscribe( forceUpdate );

	return (
		<ElementsContext.Provider value={ state.get() } >
			{ children }
		</ElementsContext.Provider>
	);
}

ElementsProvider.propTypes = {
	children: PropTypes.node,
};

const serializeModel = ( model ) => ( {
	id: model.get( 'id' ),
	elType: model.get( 'elType' ),
	elements: ( model.elements || model.get( 'elements' ) ),
	settings: model.get( 'settings' ),
	title: model.getTitle?.(),
	icon: model.getIcon?.(),
	hidden: model.get( 'hidden' ),
} );
