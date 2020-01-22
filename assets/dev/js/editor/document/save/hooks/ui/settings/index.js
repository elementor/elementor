import HookUIAfter from 'elementor-api/modules/hooks/ui/after';

export class FooterSeverRefreshMenu extends HookUIAfter {
	getCommand() {
		return 'document/elements/settings';
	}

	getId() {
		return 'footer-saver-refresh-menu';
	}

	getContainerType() {
		return 'document';
	}

	getConditions( args ) {
		return args.settings && 'undefined' !== typeof args.settings.post_status;
	}

	apply( args ) {
		const { footerSaver } = $e.components.get( 'document/save' );

		footerSaver.setMenuItems( args.container.document );

		footerSaver.refreshWpPreview();
	}
}

export default FooterSeverRefreshMenu;
