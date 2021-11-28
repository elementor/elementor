import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Icon from 'elementor-app/ui/atoms/icon';
import ItemIcon from './item-icon';
import ItemIndicatorList from './item-indicator-list';
import ItemList from './item-list';
import ItemTitle from './item-title';
import { useListStateContext } from '../context/list-state-context';
import useElement from '../hooks/use-element';
import { arrayToClassName } from 'elementor-app/utils/utils';

export default function Item( { elementId, level } ) {
	const { model, element, toggleVisibility, titleEdit, hasChildren, selected, showContextMenu, toggleSelection } = useElement( elementId ),
		[ listState, setListState ] = useListStateContext( elementId ),
		baseClassName = 'elementor-navigator__element',
		listRef = useRef( null ),
		autoExpandTimerRef = useRef( null );

	useEffect( () => {
		setListState( 0 === level );
	}, [ level ] );

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
				model.trigger( 'request:sort:start', event, ui );
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

				setTimeout( () => model.trigger( 'request:sort:update', ui, draggedItemNewIndex ) );
			},
			receive: ( event, ui ) => {
				setTimeout( () => model.trigger( 'request:sort:receive', event, ui, draggedItemNewIndex ) );
			},
		} );
	}, [ element.elType, elementId ] );

	const handleMouseEnter = ( e ) => {
		if ( 'true' !== document.getElementById( 'elementor-navigator' ).dataset.over ) {
			return;
		}

		autoExpandTimerRef.current = setTimeout( () => {
			setListState( true );
			jQuery( listRef.current ).sortable( 'refreshPositions' );
		}, 500 );
	};

	const handleMouseLeave = ( e ) => {
		if ( autoExpandTimerRef.current ) {
			clearTimeout( autoExpandTimerRef.current );
		}
	};

	const handleMouseDown = ( e ) => {
		e.stopPropagation();
		toggleSelection( { append: e.ctrlKey || e.metaKey } );
	};

	const handleContextMenu = ( e ) => {
		showContextMenu( e );
		return false;
	};

	const handleListToggle = ( e ) => {
		e.stopPropagation();
		setListState( ! listState );
	};

	return (
		<div
			className={ arrayToClassName( [
				{ [ baseClassName ]: true },
				{ [ `${ baseClassName }-${ element.elType }` ]: element.elType },
				{ [ `${ baseClassName }--has-children` ]: hasChildren },
				{ [ `${ baseClassName }-hidden` ]: element.hidden },
			] ) }
			onContextMenu={ handleContextMenu }
			onMouseEnter={ handleMouseEnter }
			onMouseLeave={ handleMouseLeave }
			data-id={ elementId }>
			{ 'document' === element.elType ||
				<div
					className={ arrayToClassName( [
						{ 'elementor-navigator__item': true },
						{ 'elementor-active': listState },
						{ 'elementor-editing': selected },
					] ) }
					onMouseDown={ handleMouseDown }
					style={ { [ `padding${ elementorCommon.config.isRTL ? 'Right' : 'Left' }` ]: level * 10 } }>
					<div className="elementor-navigator__element__list-toggle" onMouseDown={ handleListToggle }>
						<Icon className="eicon-sort-down" />
					</div>
					<ItemIcon icon={ element.icon } />
					<ItemTitle title={ element.title } onTitleEdit={ titleEdit } />
					<div className="elementor-navigator__element__toggle" onClick={ toggleVisibility }>
						<Icon className="eicon-preview-medium" />
					</div>
					<ItemIndicatorList settings={ element.settings } toggleSelection={ toggleSelection }/>
				</div>
			}
			<div style={ { display: listState ? 'block' : 'none' } }>
				<ItemList listRef={ listRef } elements={ element.elements } level={ level + 1 } indicateEmpty={ hasChildren } />
			</div>
		</div>
	);
}

Item.propTypes = {
	elementId: PropTypes.string,
	level: PropTypes.number,
};

Item.defaultProps = {
	level: 0,
};
