import { useEffect } from 'react';
import PropTypes from 'prop-types';
import Icon from 'elementor-app/ui/atoms/icon';
import ItemIcon from './item-icon';
import ItemIndicatorList from './item-indicator-list';
import ItemList from './item-list';
import ItemTitle from './item-title';
import { useListStateContext } from '../context/list-state-context';
import useElement from '../hooks/use-element';
import { arrayToClassName, mergeRefs } from 'elementor-app/utils/utils';
import { Draggable, Droppable } from 'react-beautiful-dnd';

export default function Item( { elementId, index, level } ) {
	const { element, toggleVisibility, titleEdit, hasChildren, selected, showContextMenu, toggleSelection } = useElement( elementId ),
		[ listState, setListState ] = useListStateContext( elementId ),
		baseClassName = 'elementor-navigator__element';

	useEffect( () => {
		if ( 0 === level ) {
			setListState( true );
		}
	}, [ level ] );

	const handleClick = ( e ) => {
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

	const ItemBody = ( { draggable, droppable } ) => {
		useEffect( () => {
			if ( droppable.snapshot.isDraggingOver ) {
				setListState( droppable.snapshot.isDraggingOver );
			}
		}, [ droppable.snapshot.isDraggingOver ] );

		return (
			<div
				ref={ mergeRefs( draggable.provided.innerRef, droppable.provided.innerRef ) }
				className={ arrayToClassName( [
					{ [ baseClassName ]: true },
					{ [ `${ baseClassName }-${ element.elType }` ]: element.elType },
					{ [ `${ baseClassName }--has-children` ]: hasChildren },
					{ [ `${ baseClassName }-hidden` ]: element.hidden },
					{ [ `ui-sortable-helper` ]: draggable.snapshot.isDragging },
					{ [ `elementor-dragging-on-child` ]: droppable.snapshot.isDraggingOver },
				] ) }
				onContextMenu={ handleContextMenu }
				{ ...draggable.provided.draggableProps }
				{ ...draggable.provided.dragHandleProps }>
				{ 'document' === element.elType ||
				<div
					className={ arrayToClassName( [
						{ 'elementor-navigator__item': true },
						{ 'elementor-active': listState },
						{ 'elementor-editing': selected },
					] ) }
					onClick={ handleClick }
					style={ { [ `padding${ elementorCommon.config.isRTL ? 'Right' : 'Left' }` ]: level * 10 } }>
					<div className="elementor-navigator__element__list-toggle" onClick={ handleListToggle }>
						<Icon className="eicon-sort-down" />
					</div>
					<ItemIcon icon={ element.icon } />
					<ItemTitle title={ element.title } onTitleEdit={ titleEdit } />
					<div className="elementor-navigator__element__toggle" onClick={ toggleVisibility }>
						<Icon className="eicon-preview-medium" />
					</div>
					<ItemIndicatorList settings={ element.settings } />
				</div>
				}
				<div style={ { display: listState ? 'block' : 'none' } }>
					<ItemList elements={ element.elements } level={ level + 1 } indicateEmpty={ hasChildren } />
					{ droppable.provided.placeholder }
				</div>
			</div>
		);
	};

	ItemBody.propTypes = {
		draggable: PropTypes.shape( {
			provided: PropTypes.object,
			snapshot: PropTypes.object,
		} ),
		droppable: PropTypes.shape( {
			provided: PropTypes.object,
			snapshot: PropTypes.object,
		} ),
	};

	return (
		<Draggable index={ index } draggableId={ elementId }>
			{ ( provided, snapshot ) => (
				<Droppable droppableId={ elementId } type={ element.elType }>
					{ ( _provided, _snapshot ) => (
						<ItemBody
							draggable={ { provided: provided, snapshot: snapshot } }
							droppable={ { provided: _provided, snapshot: _snapshot } } />
					) }
				</Droppable>
			) }
		</Draggable>
	);
}

Item.propTypes = {
	elementId: PropTypes.string,
	index: PropTypes.number,
	level: PropTypes.number,
};

Item.defaultProps = {
	level: 0,
};
