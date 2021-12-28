import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Header from './header';
import Icon from 'elementor-app/ui/atoms/icon';
import ItemList from './item-list';
import { Provider } from 'react-redux';

export default function Navigator( { documentId } ) {
	const NavigatorBody = () => {
		const [ root, setRoot ] = useState( [] );

		useEffect( () => {
			const updateElements = () => setTimeout(
				() => setRoot( elementor.elements.models.map( ( element ) => element.id ) )
			);

			updateElements();

			elementor.elements.on( 'add remove reset', updateElements );

			return () => {
				elementor.elements.off( 'add remove reset', updateElements );
			};
		}, [ documentId ] );

		/**
		 * Close the navigator view.
		 *
		 * @void
		 */
		const handleClose = useCallback( () => {
			$e.run( 'navigator/close' );
		}, [] );

		return (
			<div id="elementor-navigator__inner">
				<Header onClose={ handleClose } />
				<div id="elementor-navigator__elements">
					<ItemList items={ root } />
				</div>
				<div id="elementor-navigator__footer">
					<Icon className="eicon-ellipsis-h" />
				</div>
			</div>
		);
	};

	return (
		<Provider store={ $e.store.getReduxStore() }>
			<NavigatorBody />
		</Provider>
	);
}

Navigator.propTypes = {
	documentId: PropTypes.number,
};
