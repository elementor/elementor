import { useEffect, useMemo, useState } from 'react';
import { ItemProvider } from '../item-context';
import PropTypes from 'prop-types';

export function DocumentProvider( { itemId: documentId, level, ...props } ) {
	/**
	 * The document's Document instance.
	 *
	 * @var {Container|false}
	 */
	const instance = useMemo(
		() => elementorFrontend.documentsManager.documents[ documentId ],
		[ documentId ]
	);

	/**
	 * The document's direct elements list.
	 *
	 * @var {[]}
	 */
	const [ elements, setElements ] = useState( [] );

	/**
	 * The item representation of the element.
	 *
	 * @var {{}}
	 */
	const item = useMemo(
		() => ( {
			title: instance.$element.data( 'elementor-title' ),
			icon: getDocumentIcon( instance.$element.data( 'elementor-type' ) ),
			elements,
			current: elementor.documents.isCurrent( documentId ),
		} ),
		[ instance, elements ]
	);

	useEffect( () => {
		// If it's the current document, subscribe to changes in the root elements. Currently the redux store doesn't
		// manage the documents elements list, and therefore - the `elementor.elements` Backbone collection is used.
		if ( item.current ) {
			const elementsCollection = elementor.elements,
				updateElements = () => setTimeout(
					() => setElements( elementsCollection.models.map( ( element ) => element.id ) )
				);

			updateElements();

			elementsCollection.on( 'add remove reset', updateElements );

			return () => {
				elementsCollection.off( 'add remove reset', updateElements );
			};
		}
	}, [ documentId ] );

	// The document instance is currently not exported because when the documents mechanism will be re-written with
	// Redux, we'll use the document container.
	return <ItemProvider { ...props } value={ { item, level } } />;
}

DocumentProvider.propTypes = {
	itemId: PropTypes.string,
	level: PropTypes.number,
};

/**
 * Resolve the document e-icon by it's type.
 *
 * @param documentType
 * @returns {string}
 */
const getDocumentIcon = ( documentType ) => {
	switch ( documentType ) {
		case 'header':
			return 'eicon-header';
		case 'footer':
			return 'eicon-footer';
		default:
			return 'eicon-header';
	}
};

export default DocumentProvider;
