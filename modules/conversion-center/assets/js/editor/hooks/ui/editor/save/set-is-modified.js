import HookUIAfter from 'elementor-api/modules/hooks/ui/after';

export class FooterSaverActiveCopyAndShare extends HookUIAfter {
	getCommand() {
		return 'document/save/set-is-modified';
	}

	getId() {
		return 'footer-saver-activate-copy-share';
	}

	getConditions( args ) {
		const { document } = args;

		return 'links-page' === document.config.type;
	}

	apply( args ) {
		const { status, document } = args;

		$e.components.get( 'document/save' ).footerSaver.activateCopyAndShareButton(
			document.container.settings.get( 'post_status' ),
			status,
		);
	}
}

export default FooterSaverActiveCopyAndShare;
