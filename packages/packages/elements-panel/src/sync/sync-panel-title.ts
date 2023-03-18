import { __ } from '@wordpress/i18n';
import { isRouteActive, listenTo, routeOpenEvent, v1ReadyEvent } from '@elementor/v1-adapters';

type ExtendedWindow = Window & {
	elementor: {
		getPanelView: () => {
			getHeaderView: () => {
				setTitle: ( title: string ) => void;
			}
		}
	}
}

export default function syncPanelTitle() {
	const title = __( 'Elements', 'elementor' );

	listenTo(
		routeOpenEvent( 'panel/elements' ),
		() => setPanelTitle( title )
	);

	listenTo(
		v1ReadyEvent(),
		() => {
			if ( isRouteActive( 'panel/elements' ) ) {
				setPanelTitle( title );
			}
		}
	);
}

function setPanelTitle( title: string ) {
	( window as unknown as ExtendedWindow ).elementor?.getPanelView?.()?.getHeaderView?.()?.setTitle?.( title );
}
