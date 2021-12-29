import { useEffect, useMemo, useRef } from 'react';
import { BASE_ITEM_CLASS } from '../components/items';
import { useItemContext } from '../context/item-context';

export function useNavigatorJquerySortable( elementId, { setElementFolding } ) {
	const { container } = useItemContext(),
		itemRef = useRef( null ),
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
			connectWith: `.${ BASE_ITEM_CLASS }-${ container.model.attributes.elType } .elementor-navigator__elements`,
			cancel: '[contenteditable="true"]',
			start: ( e, ui ) => {
				container.model.trigger( 'request:sort:start', e, ui );
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
				jQuery( listRef.current ).closest( `.${ BASE_ITEM_CLASS }` ).addClass( 'elementor-dragging-on-child' );
			},
			out: ( e ) => {
				e.stopPropagation();
				if ( ! listRef.current ) {
					return;
				}

				jQuery( listRef.current ).closest( `.${ BASE_ITEM_CLASS }` ).removeClass( 'elementor-dragging-on-child' );
			},
			update: ( e, ui ) => {
				e.stopPropagation();
				if ( ! jQuery( listRef.current ).is( ui.item.parent() ) ) {
					return;
				}

				setTimeout( () => container.model.trigger( 'request:sort:update', ui, draggedItemNewIndex ) );
			},
		} );
	}, [ container ] );

	useEffect( () => {
		const onItemMouseEnter = () => {
				if ( 'true' !== document.getElementById( 'elementor-navigator' ).dataset.over ) {
					return;
				}

				autoExpandTimerRef.current = setTimeout( () => {
					setElementFolding( true );
					jQuery( listRef.current ).sortable( 'refreshPositions' );
				}, 500 );
			},
			onItemMouseLeave = () => {
				if ( autoExpandTimerRef.current ) {
					clearTimeout( autoExpandTimerRef.current );
				}
			};

		itemRef.current.addEventListener( 'mouseenter', onItemMouseEnter );
		itemRef.current.addEventListener( 'mouseleave', onItemMouseLeave );

		return () => {
			itemRef.current.removeEventListener( 'mouseenter', onItemMouseEnter );
			itemRef.current.removeEventListener( 'mouseleave', onItemMouseLeave );
		};
	}, [ container ] );

	return {
		itemRef,
		handleRef,
		listRef,
	};
}

export default useNavigatorJquerySortable;
