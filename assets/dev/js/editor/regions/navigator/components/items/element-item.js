import { useCallback, useMemo } from 'react';
import { useElement } from '../../hooks/use-element';
import { useElementSelection } from '../../hooks/use-element-selection';
import { useElementFolding } from '../../hooks/use-element-folding';
import { useNavigatorJquerySortable } from '../../hooks/use-navigator-jquery-sortable';
import { arrayToClassName } from 'elementor-app/utils/utils';
import Item from 'elementor-regions/navigator/components/item';
import ItemHandle from 'elementor-regions/navigator/components/item-handle';
import Icon from 'elementor-app/ui/atoms/icon';
import ItemIndicatorList from 'elementor-regions/navigator/components/item-indicator-list';
import ItemList from 'elementor-regions/navigator/components/item-list';
import PropTypes from 'prop-types';

export default function ElementItem( { itemId: elementId, level } ) {
	const { container, element } = useElement( elementId ),
		[ elementSelection, setElementSelection ] = useElementSelection( elementId ),
		[ elementFolding, setElementFolding ] = useElementFolding( elementId );

	const handleClick = useCallback(
		( e ) => {
			e.stopPropagation();
			setElementSelection( { append: e.ctrlKey || e.metaKey } );
		},
		[ setElementSelection ]
	);

	/**
	 * Toggle the visibility of the element in the document.
	 *
	 * @void
	 */
	const handleToggleVisibility = useCallback(
		() => {
			$e.run( 'navigator/elements/toggle-visibility', {
				container,
			} );
		},
		[ container ]
	);

	/**
	 * Set the element descriptive title.
	 *
	 * @void
	 */
	const handleTitleEdit = useCallback(
		( newTitle ) => {
			$e.run( 'document/elements/set-title', { container, title: newTitle } );
		},
		[ elementId ]
	);

	/**
	 * Show a context menu with actions regarding the element.
	 *
	 * @void
	 */
	const handleContextMenu = useCallback(
		( e ) => {
			container.model.trigger( 'request:contextmenu', e );
			return false;
		},
		[ container ]
	);

	/**
	 * Whether the element usually contain children (regardless to nested elements).
	 *
	 * @var {boolean}
	 */
	const hasChildrenByDefault = useMemo(
		() => {
			return element.elType &&
				( 'widget' !== element.elType || Boolean( element.elements.length ) );
		},
		[ elementId, element.elements ]
	);

	/**
	 * Use the navigator jQuery sortable helper. This is temporary, till the development of a new react-way sortable
	 * package.
	 */
	const { itemRef, handleRef, listRef } = useNavigatorJquerySortable(
		elementId,
		{ setElementFolding }
	);

	return (
		<Item
			ref={ itemRef }
			item={ element }
			level={ level }
			className={ arrayToClassName( [
				{ [ `${ Item.baseClassName }-${ element.elType }` ]: element.elType },
				{ [ `${ Item.baseClassName }--has-children` ]: hasChildrenByDefault || element.elements.length },
				{ [ `${ Item.baseClassName }-hidden` ]: element.hidden },
			] ) }
			onClick={ handleClick }
			onContextMenu={ handleContextMenu }
			data-id={ elementId }>
			<ItemHandle
				ref={ handleRef }
				className={ arrayToClassName( [
					{ 'elementor-active': elementFolding },
					{ 'elementor-editing': elementSelection },
				] ) }
				onToggleFolding={ setElementFolding }
				onTitleEdit={ handleTitleEdit }>
				<div className="elementor-navigator__element__toggle" onClick={ handleToggleVisibility }>
					<Icon className="eicon-preview-medium" />
				</div>
				<ItemIndicatorList settings={ element.settings } onToggleSelection={ setElementSelection } />
			</ItemHandle>
			<div style={ { display: elementFolding ? 'block' : 'none' } }>
				<ItemList ref={ listRef } items={ element.elements } indicateEmpty={ hasChildrenByDefault } />
			</div>
		</Item>
	);
}

ElementItem.propTypes = {
	itemId: PropTypes.string,
	level: PropTypes.number,
};
