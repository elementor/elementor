import HookUIBefore from 'elementor-api/modules/hooks/ui/before';
import HookUIAfter from 'elementor-api/modules/hooks/ui/after';
import HookUICatch from 'elementor-api/modules/hooks/ui/catch';

class onBeforeSave extends HookUIBefore {
	getCommand() {
		return 'document/save/save';
	}

	getId() {
		return 'footer-saver-on-before-save';
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

class onAfterSave extends HookUIAfter {
	getCommand() {
		return 'document/save/save';
	}

	getId() {
		return 'footer-saver-on-after-save';
	}

	apply( args, result ) {
		const { options } = args,
			{ data } = result;

		NProgress.done();

		elementor.footerSaver.ui.buttonPublish.removeClass( 'elementor-button-state' );
		elementor.footerSaver.ui.lastEditedWrapper.removeClass( 'elementor-state-active' );

		elementor.footerSaver.refreshWpPreview();
		elementor.footerSaver.setLastEdited( data );

		if ( result.statusChanged ) {
			this.onPageStatusChange( options.status );
		}
	}

	onPageStatusChange( newStatus ) {
		if ( 'publish' === newStatus ) {
			elementor.notifications.showToast( {
				message: elementor.config.document.panel.messages.publish_notification,
				buttons: [
					{
						name: 'view_page',
						text: elementor.translate( 'have_a_look' ),
						callback() {
							open( elementor.config.document.urls.permalink );
						},
					},
				],
			} );
		}
	}
}

class onCatchSave extends HookUICatch {
	getCommand() {
		return 'document/save/save';
	}

	getId() {
		return 'footer-saver-on-after-catch';
	}

	apply( args, e ) {
		NProgress.done();

		elementor.footerSaver.buttonPublish.removeClass( 'elementor-button-state' );
	}
}

class onAfterSetIsModified extends HookUIAfter {
	getCommand() {
		return 'document/save/set-is-modified';
	}

	getId() {
		return 'footer-saver-on-set-is-modified';
	}

	apply( args ) {
		const { status } = args;

		elementor.footerSaver.activateSaveButtons( status );
	}
}

module.exports = class FooterSaver extends Marionette.Behavior {
	previewWindow = null;

	ui() {
		return {
			buttonPreview: '#elementor-panel-footer-saver-preview',
			buttonPublish: '#elementor-panel-saver-button-publish',
			buttonSaveOptions: '#elementor-panel-saver-button-save-options',
			buttonPublishLabel: '#elementor-panel-saver-button-publish-label',
			menuSaveDraft: '#elementor-panel-footer-sub-menu-item-save-draft',
			lastEditedWrapper: '.elementor-last-edited-wrapper',
		};
	}

	events() {
		return {
			'click @ui.buttonPreview': 'onClickButtonPreview',
			'click @ui.buttonPublish': 'onClickButtonPublish',
			'click @ui.menuSaveDraft': 'onClickMenuSaveDraft',
		};
	}

	initialize( options ) {
		let document = options.document;

		if ( ! document ) {
			document = elementor.documents.getCurrent();
		}

		/**
		 * @type {Document}
		 */
		this.document = document;

		elementor.on( 'document:loaded', () => {
			elementor.settings.page.model.on( 'change', this.onPageSettingsChange.bind( this ) );
		} );

		elementor.footerSaver = this;

		new onBeforeSave();
		new onAfterSave();
		new onCatchSave();
		new onAfterSetIsModified();
	}

	activateSaveButtons( status ) {
		const hasChanges = status || 'draft' === elementor.settings.page.model.get( 'post_status' );

		this.ui.buttonPublish.add( this.ui.menuSaveDraft ).toggleClass( 'elementor-disabled', ! hasChanges );
		this.ui.buttonSaveOptions.toggleClass( 'elementor-disabled', ! hasChanges );
	}

	onRender() {
		this.setMenuItems( elementor.settings.page.model.get( 'post_status' ) );
		this.addTooltip();
	}

	onPageSettingsChange( settings ) {
		const changed = settings.changed;

		if ( ! _.isUndefined( changed.post_status ) ) {
			this.setMenuItems( changed.post_status );

			this.refreshWpPreview();

			// Refresh page-settings post-status value.
			if ( $e.routes.isPartOf( 'panel/page-settings' ) ) {
				$e.routes.refreshContainer( 'panel' );
			}
		}
	}

	setLastEdited( data ) {
		this.ui.lastEditedWrapper
			.removeClass( 'elementor-button-state' )
			.find( '.elementor-last-edited' )
			.html( data.config.document.last_edited );
	}

	onClickButtonPreview() {
		// Open immediately in order to avoid popup blockers.
		this.previewWindow = open( elementor.config.document.urls.wp_preview, 'wp-preview-' + elementor.config.document.id );

		if ( elementor.saver.isEditorChanged() ) {
			// Force save even if it's saving now.
			if ( elementor.saver.isSaving ) {
				elementor.saver.isSaving = false;
			}

			$e.run( 'document/save/auto' );
		}
	}

	onClickButtonPublish() {
		if ( this.ui.buttonPublish.hasClass( 'elementor-disabled' ) ) {
			return;
		}

		$e.run( 'document/save/default' );
	}

	onClickMenuSaveDraft() {
		$e.run( 'document/save/draft' );
	}

	setMenuItems( postStatus ) {
		let publishLabel = 'publish';

		switch ( postStatus ) {
			case 'publish':
			case 'private':
				publishLabel = 'update';

				if ( elementor.config.document.revisions.current_id !== elementor.config.document.id ) {
					this.activateSaveButtons( true );
				}

				break;
			case 'draft':
				if ( ! elementor.config.document.user.can_publish ) {
					publishLabel = 'submit';
				}

				this.activateSaveButtons( true );
				break;
			case 'pending': // User cannot change post status
			case undefined: // TODO: as a contributor it's undefined instead of 'pending'.
				if ( ! elementor.config.document.user.can_publish ) {
					publishLabel = 'update';
				}
				break;
		}

		this.ui.buttonPublishLabel.html( elementor.translate( publishLabel ) );
	}

	addTooltip() {
		// Create tooltip on controls
		this.$el.find( '.tooltip-target' ).tipsy( {
			// `n` for down, `s` for up
			gravity: 's',
			title() {
				return this.getAttribute( 'data-tooltip' );
			},
		} );
	}

	refreshWpPreview() {
		if ( this.previewWindow ) {
			// Refresh URL form updated config.
			try {
				this.previewWindow.location.href = elementor.config.document.urls.wp_preview;
			} catch ( e ) {
				// If the this.previewWindow is closed or it's domain was changed.
				// Do nothing.
			}
		}
	}
};
