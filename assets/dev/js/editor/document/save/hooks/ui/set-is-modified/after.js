import HookUIAfter from 'elementor-api/modules/hooks/ui/after';

export class FooterSaverAfterSetIsModified extends HookUIAfter {
	getCommand() {
		return 'document/save/set-is-modified';
	}

	getId() {
		return 'footer-saver-after-set-is-modified';
	}

	apply( args ) {
		const { status } = args;

		$e.components.get( 'document/save' ).footerSaver.activateSaveButtons( status );
	}
}

export default FooterSaverAfterSetIsModified;
