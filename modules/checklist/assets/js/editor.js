import { editorV2 } from './editor-v-2';
import Component from './component';
import { USER_PROGRESS } from './utils/consts';
import { fetchUserProgress, toggleChecklistPopup } from './utils/functions';

$e.components.register( new Component() );
editorV2();

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
		const userProgress = await fetchUserProgress(),
			editorVisitCount = userProgress?.[ USER_PROGRESS.EDITOR_VISIT_COUNT ] || null;

		if ( 2 === editorVisitCount ) {
			toggleChecklistPopup();
		}
	}

	elementor.off( 'document:loaded', checklistStartup );
}
