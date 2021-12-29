import { Provider } from 'react-redux';
import { useCallback, useEffect, useState } from 'react';
import { Empty, ItemList, Header } from './';
import Icon from 'elementor-app/ui/atoms/icon';
import PropTypes from 'prop-types';

export function Navigator() {
	const NavigatorBody = () => {
		const [ root, setRoot ] = useState( [] );

		useEffect( () => {
			// Subscribe to changes in the root document elements. Currently the redux store doesn't manage the root
			// elements list, and therefore - the `elementor.elements` Backbone collection is used.
			const updateElements = () => setTimeout(
				() => setRoot( elementor.elements.models.map( ( element ) => element.id ) )
			);

			updateElements();

			elementor.elements.on( 'add remove reset', updateElements );

			return () => {
				elementor.elements.off( 'add remove reset', updateElements );
			};
		}, [] );

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
					{ root.length ?
						<ItemList items={ root } /> :
						<Empty />
					}
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
};

export default Navigator;
