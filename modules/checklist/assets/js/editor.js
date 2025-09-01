import { editorAppBarLink } from './editor-app-bar-link';
import Component from './component';
import { USER_PROGRESS } from './utils/consts';
import { fetchUserProgress, toggleChecklistPopup, dispatchChecklistOpenEvent } from './utils/functions';

$e.components.register( new Component() );
editorAppBarLink();

elementorCommon.elements.$window.on( 'elementor:loaded', elementorLoaded );

function elementorLoaded() {
	elementor.on( 'document:loaded', checklistStartup );
	elementorCommon.elements.$window.off( 'elementor:loaded', elementorLoaded );
}

async function checklistStartup() {
	const shouldHide = 'yes' !== elementor.getPreferences( 'show_launchpad_checklist' );

	if ( shouldHide ) {
		$e.commands.run( 'checklist/toggle-icon', false );
	} else {
		const userProgress = await fetchUserProgress();

		if ( userProgress?.[ USER_PROGRESS.SHOULD_OPEN_IN_EDITOR ] ) {
			toggleChecklistPopup();
			dispatchChecklistOpenEvent();
		}
	}

	elementor.off( 'document:loaded', checklistStartup );
}
