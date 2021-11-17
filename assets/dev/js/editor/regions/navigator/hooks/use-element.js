import { useCallback, useEffect, useState, useReducer } from 'react';

export default function useElement( elementId ) {
	const [ model, setModel ] = useState( elementor.navigator.initialModel ),
		[ selected, setSelected ] = useState( false ),
		[ , forceUpdate ] = useReducer( () => ( {} ) );

	useEffect( () => {
		setModel( elementor.getContainer( elementId ).model );
	}, [ elementId ] );

	useEffect( () => {
		model.on( 'change', forceUpdate );
		model.get( 'elements' ).bind( 'add remove reset', forceUpdate );

		if ( 'document' !== model.get( 'elType' ) ) {
			model.get( 'settings' ).on( 'change', forceUpdate );

			elementor.selection.on( 'change', ( { container, state } ) => {
				if ( elementId === container.model.get( 'id' ) ) {
					setSelected( state );
				}
			} );
		}

		return () => {
			// Should I remove the event listeners on unmount?
		};
	}, [ model ] );

	const titleEdit = useCallback( ( title ) => {
		const settings = model.get( 'settings' );

		settings.set( '_title', title.trim() );

		$e.internal( 'document/save/set-is-modified', {
			status: true,
		} );
	}, [ model ] );

	const hasChildren = 'widget' !== model.get( 'elType' ) ||
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
		model,
		element: serializeModel( model ),
		toggleVisibility,
		titleEdit,
		hasChildren,
		selected,
		showContextMenu,
		toggleSelection,
	};
}

const serializeModel = ( model ) => ( {
	id: model.get( 'id' ),
	elType: model.get( 'elType' ),
	elements: model.get( 'elements' ).models || model.get( 'elements' ),
	settings: model.get( 'settings' ),
	title: model.getTitle?.(),
	icon: model.getIcon?.(),
	hidden: model.get( 'hidden' ),
} );
