import * as hooksUI from '../hooks/ui/';

module.exports = class FooterSaver extends Marionette.Behavior {
	previewWindow = null;

	static initOnce = false;

	static initHooks() {
		Object.values( hooksUI ).forEach(
			( Hook ) => new Hook()
		);
	}

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
		this.document = options.document || elementor.documents.getCurrent();

		elementor.footerSaver = this;

		if ( ! FooterSaver.initOnce ) {
			FooterSaver.initHooks();

			FooterSaver.initOnce = true;
		}
	}

	activateSaveButtons( status ) {
		const hasChanges = status || 'draft' === elementor.settings.page.model.get( 'post_status' );

		this.ui.buttonPublish.add( this.ui.menuSaveDraft ).toggleClass( 'elementor-disabled', ! hasChanges );
		this.ui.buttonSaveOptions.toggleClass( 'elementor-disabled', ! hasChanges );
	}

	onRender() {
		this.setMenuItems( elementor.settings.page.model.get( 'post_status' ) );
		// TODO: Check with mati.
		//this.setLastEdited( elementor.config.document.last_edited );
		this.addTooltip();
	}

	setLastEdited( lastEdited ) {
		this.ui.lastEditedWrapper
			.removeClass( 'elementor-button-state' )
			.find( '.elementor-last-edited' )
			.html( lastEdited );
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
