import { useCallback, useEffect, useState, useReducer } from 'react';

export default function useElement( elementId ) {
	const [ model, setModel ] = useState( elementor.navigator.initialModel ),
		[ selected, setSelected ] = useState( false ),
		[ , forceUpdate ] = useReducer( () => ( {} ) );

	useEffect( () => {
		setModel( elementId ?
			elementor.getContainer( elementId ).model :
			elementor.elementsModel );
	}, [ elementId ] );

	useEffect( () => {
		model.on( 'change', forceUpdate );
		model.get( 'elements' ).bind( 'add remove reset', forceUpdate );

		if ( elementId ) {
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

	const toggleVisibility = () => {
		model.trigger( 'request:toggleVisibility' );
	};

	const titleEdit = useCallback( ( title ) => {
		const settings = model.get( 'settings' );

		settings.set( '_title', title.trim() );

		$e.internal( 'document/save/set-is-modified', {
			status: true,
		} );
	}, [ model ] );

	const hasChildren = 'widget' !== model.get( 'elType' ) ||
		Boolean( model.get( 'elements' ).length );

	return {
		model,
		element: serializeModel( model ),
		toggleVisibility,
		titleEdit,
		hasChildren,
		selected,
		toggleSelection: ( { append = false } ) => {
			elementor.getContainer( elementId ).model
				.trigger( 'request:edit', {
					append,
					scrollIntoView: true,
				} );
		},
	};
}

const serializeModel = ( model ) => ( {
	...model.toJSON(),
	elements: ( model.elements || model.get( 'elements' ) ).map(
		( element ) => serializeModel( element )
	),
	title: model.getTitle?.(),
	icon: model.getIcon?.(),
} );
