import { arrayToClassName } from 'elementor-app/utils/utils';
import { BASE_ITEM_CLASS } from './';
import { ElementProvider } from '../../context/item-context/providers';
import { ItemHandle, ItemIndicatorList, ItemList } from '../';
import { useCallback, useMemo } from 'react';
import { useElementFolding, useElementSelection, useNavigatorJquerySortable } from '../../hooks';
import { useItemContext } from 'elementor-regions/navigator/context/item-context';
import Icon from 'elementor-app/ui/atoms/icon';
import PropTypes from 'prop-types';

export function ElementItem( { itemId: elementId, level } ) {
	const ElementBody = () => {
		const { item: element, container } = useItemContext(),
			[ elementSelection, setElementSelection ] = useElementSelection( elementId ),
			[ elementFolding, setElementFolding ] = ( () => {
				// If element is the root element, or has no children by default (like widgets), folding capabilities
				// are not initialized, and the element is not added to the folding state. This is important because
				// the navigator toggle-all button state(up/down) should not consider those elements.
				return element.root || ! element.hasChildrenByDefault ?
					[ true, () => {} ] :
					useElementFolding( elementId );
			} )();

		/**
		 * Set the element selection state in the store.
		 *
		 * @void
		 */
		const handleToggleSelection = useCallback(
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
		 * Activate a specific section in the panel regarding the element.
		 *
		 * @void
		 */
		const handleActivateSection = useCallback(
			( section ) => {
				setElementSelection( { section } );
			},
			[ setElementSelection ]
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
		 * Use the navigator jQuery sortable helper. This is temporary, till the development of a new react-way sortable
		 * package.
		 */
		const { itemRef, handleRef, listRef } = useNavigatorJquerySortable(
			elementId,
			{ setElementFolding }
		);

		return (
			<div
				ref={ itemRef }
				className={ arrayToClassName( [
					{ [ BASE_ITEM_CLASS ]: true },
					{ [ `${ BASE_ITEM_CLASS }-${ element.elType }` ]: element.elType },
					{ [ `${ BASE_ITEM_CLASS }--has-children` ]: element.hasChildrenByDefault || element.elements.length },
					{ [ `${ BASE_ITEM_CLASS }--hidden` ]: element.hidden },
				] ) }
				onClick={ handleToggleSelection }
				onContextMenu={ handleContextMenu }
				data-id={ elementId }>
				{ ! element.root &&
					<ItemHandle
						ref={ handleRef }
						className={ arrayToClassName( [
							{ 'elementor-active': elementFolding },
							{ 'elementor-editing': elementSelection },
						] ) }
						onToggleFolding={ setElementFolding }
						onTitleEdit={ handleTitleEdit }>
						<div className="elementor-navigator__element__toggle" onClick={ handleToggleVisibility }>
							<Icon className="eicon-preview-medium"/>
						</div>
						<ItemIndicatorList settings={ element.settings } onActivateSection={ handleActivateSection }/>
					</ItemHandle> }
				<div style={ { display: elementFolding ? 'block' : 'none' } }>
					<ItemList ref={ listRef } items={ element.elements } indicateEmpty={ element.hasChildrenByDefault } />
				</div>
			</div>
		);
	};

	return (
		<ElementProvider itemId={ elementId } level={ level }>
			<ElementBody />
		</ElementProvider>
	);
 }

ElementItem.propTypes = {
	itemId: PropTypes.string,
	level: PropTypes.number,
};

export default ElementItem;
