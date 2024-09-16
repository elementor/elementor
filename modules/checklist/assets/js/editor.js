import { editorV2 } from './editor-v-2';
import Component from './component';

$e.components.register( new Component() );
editorV2();

window.addEventListener( 'DOMContentLoaded', maybeHideToggleIcon );

function maybeHideToggleIcon() {
	const shouldHide = 'yes' !== elementor.getPreferences( 'show_launchpad_checklist' );

	if ( shouldHide ) {
		$e.commands.run( 'checklist/toggle-icon', false );
	}

	window.removeEventListener( 'DOMContentLoaded', maybeHideToggleIcon );
}
