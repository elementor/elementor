import { useEffect } from 'react';
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
	const { element, toggleVisibility, titleEdit, hasChildren, selected, showContextMenu, toggleSelection } = useElement( elementId ),
		[ listState, setListState ] = useListStateContext( elementId ),
		baseClassName = 'elementor-navigator__element';

	useEffect( () => {
		setListState( 0 === level );
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

	return (
		<div
			className={ arrayToClassName( [
				{ [ baseClassName ]: true },
				{ [ `${ baseClassName }-${ element.elType }` ]: element.elType },
				{ [ `${ baseClassName }--has-children` ]: hasChildren },
				{ [ `${ baseClassName }-hidden` ]: element.hidden },
			] ) }
			onContextMenu={ handleContextMenu }>
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
