import HookUIAfter from 'elementor-api/modules/hooks/ui/after';

export class FooterSaverActiveSaveButtons extends HookUIAfter {
	getCommand() {
		return 'document/save/set-is-modified';
	}

	getId() {
		return 'footer-saver-activate-save-buttons';
	}

	apply( args ) {
		const { status, document } = args;

		$e.components.get( 'document/save' ).footerSaver.activateSaveButtons( document, status );
	}
}

export default FooterSaverActiveSaveButtons;
