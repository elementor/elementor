import { Provider } from 'react-redux';
import { useCallback } from 'react';
import { Empty, Header } from './';
import { ElementItem } from './items';
import Icon from 'elementor-app/ui/atoms/icon';

export function Navigator() {
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
					<ElementItem itemId="document" level={ 0 } />
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

export default Navigator;
