import { useEffect, useRef } from 'react';

export function useNavigatorJquerySortable( container, { baseClassName, handleToggleFolding } ) {
	const itemRef = useRef( null ),
		handleRef = useRef( null ),
		listRef = useRef( null ),
		autoExpandTimerRef = useRef( null );

	useEffect( () => {
		let draggedItemNewIndex;

		jQuery( listRef.current ).sortable( {
			items: '> *:not(.elementor-empty-view)',
			placeholder: 'ui-sortable-placeholder',
			axis: 'y',
			forcePlaceholderSize: true,
			connectWith: `.${ baseClassName }-${ element.elType } .elementor-navigator__elements`,
			cancel: '[contenteditable="true"]',
			start: ( event, ui ) => {
				container.model.trigger( 'request:sort:start', event, ui );
				jQuery( ui.item ).children( '.elementor-navigator__item' ).trigger( 'click' );
				document.getElementById( 'elementor-navigator' ).dataset.over = 'true';
			},
			stop: ( e, ui ) => {
				draggedItemNewIndex = ui.item.index();
				jQuery( ui.sender ).sortable( 'cancel' );
				jQuery( listRef.current ).sortable( 'cancel' );
				document.getElementById( 'elementor-navigator' ).dataset.over = 'false';
			},
			over: ( e ) => {
				e.stopPropagation();
				jQuery( listRef.current ).closest( `.${ baseClassName }` ).addClass( 'elementor-dragging-on-child' );
			},
			out: ( e ) => {
				e.stopPropagation();
				if ( ! listRef.current ) {
					return;
				}

				jQuery( listRef.current ).closest( `.${ baseClassName }` ).removeClass( 'elementor-dragging-on-child' );
			},
			update: ( e, ui ) => {
				e.stopPropagation();
				if ( ! jQuery( listRef.current ).is( ui.item.parent() ) ) {
					return;
				}

				setTimeout( () => container.model.trigger( 'request:sort:update', ui, draggedItemNewIndex ) );
			},
			receive: ( event, ui ) => {
				setTimeout( () => container.model.trigger( 'request:sort:receive', event, ui, draggedItemNewIndex ) );
			},
		} );

		itemRef.current.addEventListener( 'mouseenter', () => {
			if ( 'true' !== document.getElementById( 'elementor-navigator' ).dataset.over ) {
				return;
			}

			autoExpandTimerRef.current = setTimeout( () => {
				handleToggleFolding( true );
				jQuery( listRef.current ).sortable( 'refreshPositions' );
			}, 500 );
		} );

		itemRef.current.addEventListener( 'mouseleave', () => {
			if ( autoExpandTimerRef.current ) {
				clearTimeout( autoExpandTimerRef.current );
			}
		} );

		handleRef.current.addEventListener( 'mousedown', ( e ) => {
			e.stopPropagation();
		} );
	}, [ container ] );

	return {
		itemRef,
		handleRef,
		listRef,
	};
}

export default useNavigatorJquerySortable;
