import { arrayToClassName } from 'elementor-app/utils/utils';
import { BASE_ITEM_CLASS } from './';
import { DocumentProvider } from '../../context/item-context/providers';
import { ItemEdit, ItemHandle, ItemList } from '../';
import { useCallback } from 'react';
import { useItemContext } from 'elementor-regions/navigator/context/item-context';
import PropTypes from 'prop-types';

export function DocumentItem( { itemId: documentId, level } ) {
	const DocumentBody = () => {
		const { item: document } = useItemContext();

		const handleItemEdit = useCallback(
			() => {
				elementorCommon.api.internal( 'panel/state-loading' );

				elementorCommon.api
					.run( 'editor/documents/switch', {
						id: documentId,
						source: 'navigator',
					} )
					.finally( () => elementorCommon.api.internal( 'panel/state-ready' ) );
			},
			[ documentId ]
		);

		return (
			<div
				className={ arrayToClassName( [
					{ [ BASE_ITEM_CLASS ]: true },
					{ [ `${ BASE_ITEM_CLASS }-document` ]: true },
					{ [ `${ BASE_ITEM_CLASS }--has-children` ]: document.elements.length },
				] ) }>
				<ItemHandle>
					{ document.current ||
						<ItemEdit onItemEdit={ handleItemEdit } /> }
				</ItemHandle>
				<div style={ { display: 'block' } }>
					<ItemList items={ document.elements } style={ { display: 'block' } } indicateEmpty={ document.current } />
				</div>
			</div>
		);
	};

	return (
		<DocumentProvider itemId={ documentId } level={ level }>
			<DocumentBody />
		</DocumentProvider>
	);
 }

DocumentItem.propTypes = {
	itemId: PropTypes.string,
	level: PropTypes.number,
};

export default DocumentItem;
