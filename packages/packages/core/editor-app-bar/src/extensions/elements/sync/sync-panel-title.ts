import {
	__privateIsRouteActive as isRouteActive,
	__privateListenTo as listenTo,
	isExperimentActive,
	routeOpenEvent,
	v1ReadyEvent,
} from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

type ExtendedWindow = Window & {
	elementor: {
		getPanelView: () => {
			getHeaderView: () => {
				setTitle: ( title: string ) => void;
			};
		};
	};
};

const V4_EXPERIMENT = 'e_atomic_elements';
const ATOMIC_PANEL_EXPERIMENT = 'e_editor_atomic_panel';

export default function syncPanelTitle() {
	const panelTitle = isAtomicElementsPanelEnabled() ? __( 'Add', 'elementor' ) : __( 'Elements', 'elementor' );
	const tabTitle = __( 'Widgets', 'elementor' );

	listenTo( routeOpenEvent( 'panel/elements' ), () => {
		setPanelTitle( panelTitle );
		setTabTitle( tabTitle );
	} );

	listenTo( v1ReadyEvent(), () => {
		if ( isRouteActive( 'panel/elements' ) ) {
			setPanelTitle( panelTitle );
			setTabTitle( tabTitle );
		}
	} );
}

function isAtomicElementsPanelEnabled() {
	return isExperimentActive( V4_EXPERIMENT ) && isExperimentActive( ATOMIC_PANEL_EXPERIMENT );
}

function setPanelTitle( title: string ) {
	( window as unknown as ExtendedWindow ).elementor?.getPanelView?.()?.getHeaderView?.()?.setTitle?.( title );
}

function setTabTitle( title: string ) {
	const tab = document.querySelector( '.elementor-component-tab[data-tab="categories"]' );

	if ( tab ) {
		tab.textContent = title;
	}
}
