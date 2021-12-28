import { useEffect, useMemo, useRef } from 'react';
import Item from '../components/item';

export function useNavigatorJquerySortable( elementId, { setElementFolding } ) {
	const itemRef = useRef( null ),
		handleRef = useRef( null ),
		listRef = useRef( null ),
		autoExpandTimerRef = useRef( null );

	/**
	 * The element's Container instance.
	 *
	 * @var {Container|false}
	 */
	const container = useMemo( () => {
		return elementor.getContainer( elementId );
	}, [ elementId ] );

	useEffect( () => {
		let draggedItemNewIndex;

		jQuery( listRef.current ).sortable( {
			items: '> *:not(.elementor-empty-view)',
			placeholder: 'ui-sortable-placeholder',
			axis: 'y',
			forcePlaceholderSize: true,
			connectWith: `.${ Item.baseClassName }-${ container.model.attributes.elType } .elementor-navigator__elements`,
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
				jQuery( listRef.current ).closest( `.${ Item.baseClassName }` ).addClass( 'elementor-dragging-on-child' );
			},
			out: ( e ) => {
				e.stopPropagation();
				if ( ! listRef.current ) {
					return;
				}

				jQuery( listRef.current ).closest( `.${ Item.baseClassName }` ).removeClass( 'elementor-dragging-on-child' );
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
