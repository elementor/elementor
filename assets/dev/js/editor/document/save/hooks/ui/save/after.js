import HookUIAfter from 'elementor-api/modules/hooks/ui/after';

export class FooterSaverAfterSave extends HookUIAfter {
	getCommand() {
		return 'document/save/save';
	}

	getId() {
		return 'footer-saver-after-save';
	}

	apply( args, result ) {
		const { status } = args,
			{ data } = result,
			{ footerSaver } = $e.components.get( 'document/save' );

		NProgress.done();

		footerSaver.ui.buttonPublish.removeClass( 'elementor-button-state' );
		footerSaver.ui.lastEditedWrapper.removeClass( 'elementor-state-active' );

		footerSaver.refreshWpPreview();
		footerSaver.setLastEdited( data.config.document.last_edited );

		if ( result.statusChanged ) {
			this.onPageStatusChange( status );
		}
	}

	onPageStatusChange( newStatus ) {
		if ( 'publish' === newStatus ) {
			const options = {
				message: elementor.config.document.panel.messages.publish_notification,
			};

			// Don't add the "Have a look" link in the theme builder.
			if ( elementor.config.document.support_site_editor ) {
				options.buttons = [
					{
						name: 'open_site_editor',
						text: '<i class="eicon-external-link-square"></i><span class="e-theme-builder-toaster-button-text">' + elementorPro.translate( 'open_site_editor' ) + '</span>',
						callback() {
							$e.run( 'app/open' );
						},
					},
					{
						name: 'view_live_site',
						text: '<i class="eicon-preview-medium"></i><span class="e-theme-builder-toaster-button-text">' + elementorPro.translate( 'view_live_site' ) + '</span>',
						callback() {
							open( elementor.config.document.urls.permalink );
						},
					},
				];

				options.classes = 'e-theme-builder-save-toaster';
			} else if ( elementor.config.document.urls.have_a_look ) {
				options.buttons = [
					{
						name: 'view_page',
						text: elementor.translate( 'have_a_look' ),
						callback() {
							open( elementor.config.document.urls.have_a_look );
						},
					},
				];
			}

			elementor.notifications.showToast( options );
		}
	}
}

export default FooterSaverAfterSave;
