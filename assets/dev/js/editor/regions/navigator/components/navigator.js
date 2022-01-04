import { Provider } from 'react-redux';
import { ItemList, Header } from './';
import { useCallback } from 'react';
import Icon from 'elementor-app/ui/atoms/icon';
import PropTypes from 'prop-types';

export function Navigator( { documents } ) {
	const NavigatorBody = () => {
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
					<ItemList items={ documents } type="document" />
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
	documents: PropTypes.arrayOf(
		PropTypes.string
	),
};

export default Navigator;
