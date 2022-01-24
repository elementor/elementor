import { useEffect, useRef } from 'react';
import { BASE_ITEM_CLASS } from '../components/items';
import { useItemContext } from '../context/item-context';

export function useNavigatorJquerySortable( elementId, { setElementFolding } ) {
	const { container } = useItemContext(),
		itemRef = useRef( null ),
		handleRef = useRef( null ),
		listRef = useRef( null ),
		autoExpandTimerRef = useRef( null );

	useEffect( () => {
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
				// Turn on sorting state of the navigator.
				document.getElementById( 'elementor-navigator' ).dataset.over = 'true';
			},
			stop: ( e, ui ) => {
				jQuery( listRef.current ).sortable( 'cancel' );
				// Turn off sorting state of the navigator.
				document.getElementById( 'elementor-navigator' ).dataset.over = 'false';
			},
			over: ( e, ui ) => {
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

				const draggedItemIndex = ui.item.index();

				setTimeout( () => {
					container.model.trigger( 'request:sort:update', ui, draggedItemIndex );
				} );
			},
		} );

		return () => {
			jQuery( listRef.current ).sortable( 'destroy' );
		};
	}, [ container ] );

	useEffect( () => {
		const onItemMouseEnter = ( e ) => {
				// Check whether sorting state of the navigator is active. Currently the sorting state is kept using
				// dataset.
				if ( 'true' !== document.getElementById( 'elementor-navigator' ).dataset.over ) {
					return;
				}

				autoExpandTimerRef.current = setTimeout( () => {
					setElementFolding( true );
					jQuery( listRef.current ).sortable( 'refreshPositions' );
				}, 500 );

				e.target.classList.add( 'elementor-dragging-on-child' );
			},
			onItemMouseLeave = ( e ) => {
				if ( autoExpandTimerRef.current ) {
					clearTimeout( autoExpandTimerRef.current );
				}

				e.target.classList.remove( 'elementor-dragging-on-child' );
			},
			onHandleMouseDown = () => {
				document.activeElement.blur();
			};

		itemRef.current.addEventListener( 'mouseenter', onItemMouseEnter );
		itemRef.current.addEventListener( 'mouseleave', onItemMouseLeave );
		handleRef.current.addEventListener( 'mousedown', onHandleMouseDown );

		return () => {
			itemRef.current.removeEventListener( 'mouseenter', onItemMouseEnter );
			itemRef.current.removeEventListener( 'mouseleave', onItemMouseLeave );
			handleRef.current.removeEventListener( 'mousedown', onHandleMouseDown );
		};
	}, [ container ] );

	return {
		itemRef,
		handleRef,
		listRef,
	};
}

export default useNavigatorJquerySortable;
