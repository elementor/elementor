import HookUIBefore from 'elementor-api/modules/hooks/ui/before';

export class FooterSaverBeforeSave extends HookUIBefore {
	getCommand() {
		return 'document/save/save';
	}

	getId() {
		return 'footer-saver-before-save';
	}

	apply( args ) {
		const { options = {} } = args;

		NProgress.start();

		if ( 'autosave' === options.status ) {
			elementor.footerSaver.ui.lastEditedWrapper.addClass( 'elementor-state-active' );
		} else {
			elementor.footerSaver.ui.buttonPublish.addClass( 'elementor-button-state' );
		}
	}
}

export default FooterSaverBeforeSave;
