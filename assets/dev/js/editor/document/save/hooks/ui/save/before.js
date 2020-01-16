import HookUIBefore from 'elementor-api/modules/hooks/ui/before';

export class FooterSaverBeforeSave extends HookUIBefore {
	getCommand() {
		return 'document/save/save';
	}

	getId() {
		return 'footer-saver-before-save';
	}

	apply( args ) {
		const { status } = args,
			{ footerSaver } = $e.components.get( 'document/save' );

		NProgress.start();

		if ( 'autosave' === status ) {
			footerSaver.ui.lastEditedWrapper.addClass( 'elementor-state-active' );
		} else {
			footerSaver.ui.buttonPublish.addClass( 'elementor-button-state' );
		}
	}
}

export default FooterSaverBeforeSave;
