import { useCallback, useEffect, useState, useReducer } from 'react';

export default function useElement( elementId ) {
	const model = elementor.getContainer( elementId ).model,
		[ selected, setSelected ] = useState( false ),
		[ , forceUpdate ] = useReducer( () => ( {} ) ),
		element = serializeModel( model );

	useEffect( () => {
		const updateSelection = ( { container, state } ) => {
			if ( elementId === container.model.get( 'id' ) ) {
				setSelected( state );
			}
		};

		model.on( 'change', forceUpdate );
		model.get( 'elements' ).on( 'add remove reset', forceUpdate );

		if ( 'document' !== model.get( 'elType' ) ) {
			model.get( 'settings' ).on( 'change', forceUpdate );
			elementor.selection.on( 'change', updateSelection );
		}

		return () => {
			model.off( 'change', forceUpdate );
			model.get( 'elements' ).off( 'add remove reset', forceUpdate );

			if ( 'document' !== model.get( 'elType' ) ) {
				model.get( 'settings' ).off( 'change', forceUpdate );
				elementor.selection.off( 'change', updateSelection );
			}
		};
	}, [ model ] );

	const titleEdit = useCallback( ( title ) => {
		const settings = model.get( 'settings' );

		settings.set( '_title', title.trim() );

		$e.internal( 'document/save/set-is-modified', {
			status: true,
		} );
	}, [ model ] );

	const hasChildren = 'widget' !== element.elType ||
			Boolean( element.elements.length );

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
		element,
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
