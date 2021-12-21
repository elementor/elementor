import { useCallback } from 'react';
import Header from './header';
import Icon from 'elementor-app/ui/atoms/icon';
import ItemList from './item-list';
import { Provider, useSelector } from 'react-redux';

export default function Navigator() {
	const NavigatorBody = () => {
		// The document element used to check whether it has children, if not - empty state will be displayed. When header
		// and footer documents will be added to the navigator, it won't be necessary, sine the navigator will never be
		// empty.
		const elements = useSelector(
			( state ) => Object.values( state[ 'document/elements' ] )
		).map( ( element ) => element.id );

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
					<ItemList elements={ elements } />
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
