import { __ } from '@wordpress/i18n';
import { listenTo, routeOpenEvent, runCommand, v1ReadyEvent } from '@elementor/v1-adapters';

export default function syncPanelTitle() {
	listenTo(
		[
			v1ReadyEvent(),
			routeOpenEvent( 'panel/elements' ),
		],
		() => {
			const title = __( 'Widget Panel', 'elementor' );

			runCommand( 'panel/set-title', { title } );
		}
	);
}
