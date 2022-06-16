import { useEffect, useRef } from 'react';
import { BASE_ITEM_CLASS } from '../components/items';
import { useItemContext } from '../context/item-context';

export function useNavigatorJquerySortable( elementId, { setElementFolding } ) {
	const { container } = useItemContext(),
		itemRef = useRef( null ),
		handleRef = useRef( null ),
		listRef = useRef( null ),
		autoExpandTimerRef = useRef( null );
	let autoExpand = false;

	useEffect( () => {
		// For disabling sortable in testing environments.
		if ( false === container.sortable ) {
			return;
		}

		jQuery( listRef.current ).sortable( {
			items: '> *:not(.elementor-empty-view)',
			placeholder: 'ui-sortable-placeholder',
			axis: 'y',
			forcePlaceholderSize: true,
			connectWith: `.${ BASE_ITEM_CLASS }-${ container.model.get( 'elType' ) } > .elementor-navigator__elements`,
			cancel: '[contenteditable="true"]',
			start: ( e, ui ) => {
				container.model.trigger( 'request:sort:start', e, ui );
				jQuery( ui.item ).children( '.elementor-navigator__item' ).trigger( 'click' );
				// Turn on sorting state of the navigator.
				elementor.navigator.region.el.dataset.over = 'true';
			},
			stop: () => {
				jQuery( listRef.current ).sortable( 'cancel' );
				// Turn off sorting state of the navigator.
				elementor.navigator.region.el.dataset.over = 'false';
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

				const draggedItemIndex = ui.item.index();

				setTimeout( () => {
					if ( autoExpand ) {
						setElementFolding( true );
					}

					container.model.trigger( 'request:sort:update', ui, draggedItemIndex );
				} );
			},
		} );

		return () => {
			jQuery( listRef.current ).sortable( 'destroy' );
		};
	}, [ container ] );

	useEffect( () => {
		const onItemMouseEnter = () => {
				// Check whether sorting state of the navigator is active. Currently the sorting state is kept using
				// dataset.
				if ( 'true' !== elementor.navigator.region.el.dataset.over ) {
					return;
				}

				autoExpandTimerRef.current = setTimeout( () => {
					// Using `slideDown` instead of `setElementFolding` because changing element's state re-renders the
					// component, and a new sortable-instance is generated, and dragging elements to an auto-expanded
					// list is not working as expected.
					jQuery( listRef.current ).slideDown( () => {
						jQuery( listRef.current ).sortable( 'refreshPositions' );
						autoExpand = true;
					} );
				}, 500 );
			},
			onItemMouseLeave = () => {
				if ( autoExpandTimerRef.current ) {
					clearTimeout( autoExpandTimerRef.current );
				}
			},
			onHandleMouseDown = () => {
				document.activeElement.blur();
			};

		itemRef.current.addEventListener( 'mouseenter', onItemMouseEnter );
		itemRef.current.addEventListener( 'mouseleave', onItemMouseLeave );
		handleRef.current.addEventListener( 'mousedown', onHandleMouseDown );

		return () => {
			if ( itemRef.current ) {
				itemRef.current.removeEventListener( 'mouseenter', onItemMouseEnter );
				itemRef.current.removeEventListener( 'mouseleave', onItemMouseLeave );
			}
			if ( handleRef.current ) {
				handleRef.current.removeEventListener( 'mousedown', onHandleMouseDown );
			}
		};
	}, [ container ] );

	return {
		itemRef,
		handleRef,
		listRef,
	};
}

export default useNavigatorJquerySortable;
