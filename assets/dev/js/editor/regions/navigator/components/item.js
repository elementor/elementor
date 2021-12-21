import { useCallback } from 'react';
import PropTypes from 'prop-types';
import Icon from 'elementor-app/ui/atoms/icon';
import ItemIcon from './item-icon';
import ItemIndicatorList from './item-indicator-list';
import ItemList from './item-list';
import ItemTitle from './item-title';
import { useElement, useElementSelection, useElementFolding, useNavigatorJquerySortable } from '../hooks';
import { arrayToClassName } from 'elementor-app/utils/utils';

export default function Item( { elementId, level } ) {
	const { container, element } = useElement( elementId ),
		[ elementSelection, elementFolding ] = [ useElementSelection( elementId ), useElementFolding( elementId ) ],
		baseClassName = 'elementor-navigator__element';

	/**
	 * Toggle the selection state of the element.
	 *
	 * @void
	 */
	const handleToggleSelection = useCallback(
		( { section, scrollIntoView = true } ) => ( e ) => {
			e.stopPropagation();
			$e.run( 'document/elements/toggle-selection', {
				container,
				append: e.ctrlKey || e.metaKey,
				options: {
					scrollIntoView,
					section,
				},
			} );
		},
		[ container ]
	);

	/**
	 * Toggle the folding status of the children elements list.
	 *
	 * @void
	 */
	const handleToggleFolding = ( e ) => {
		e.stopPropagation();

		$e.run( 'navigator/elements/toggle-folding', {
			container,
		} );
	};

	/**
	 * Toggle the visibility of the element in the document.
	 *
	 * @void
	 */
	const handleToggleVisibility = () => {
		$e.run( 'navigator/elements/toggle-visibility', {
			container,
		} );
	};

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
	const handleContextMenu = () => useCallback(
		( e ) => {
			container.model.trigger( 'request:contextmenu', e );
			return false;
		},
		[ container ]
	);

	/**
	 * Use the navigator jQuery sortable helper. This is temporary, till the development of a new reacy-way sortable
	 * package.
	 */
	const { itemRef, handleRef, listRef } = useNavigatorJquerySortable(
		container,
		{ baseClassName, handleToggleFolding }
	);

	return (
		<div
			ref={ itemRef }
			className={ arrayToClassName( [
				{ [ baseClassName ]: true },
				{ [ `${ baseClassName }-${ element.elType }` ]: element.elType },
				{ [ `${ baseClassName }--has-children` ]: true },
				{ [ `${ baseClassName }-hidden` ]: element.hidden },
			] ) }
			onContextMenu={ handleContextMenu }
			data-id={ elementId }>
			{ 'document' === element.elType ||
				<div
					ref={ handleRef }
					className={ arrayToClassName( [
						{ 'elementor-navigator__item': true },
						{ 'elementor-active': elementFolding },
						{ 'elementor-editing': elementSelection },
					] ) }
					style={ { [ `padding${ elementorCommon.config.isRTL ? 'Right' : 'Left' }` ]: level * 10 } }>
					<div className="elementor-navigator__element__list-toggle" onMouseDown={ handleToggleFolding }>
						<Icon className="eicon-sort-down" />
					</div>
					<ItemIcon icon={ element.icon } />
					<ItemTitle title={ element.title } onTitleEdit={ handleTitleEdit } />
					<div className="elementor-navigator__element__toggle" onClick={ handleToggleVisibility }>
						<Icon className="eicon-preview-medium" />
					</div>
					<ItemIndicatorList settings={ element.settings } toggleSelection={ handleToggleSelection }/>
				</div>
			}
			<div style={ { display: elementFolding ? 'block' : 'none' } }>
				<ItemList listRef={ listRef } elements={ element.elements } level={ level + 1 } indicateEmpty={ true } />
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
