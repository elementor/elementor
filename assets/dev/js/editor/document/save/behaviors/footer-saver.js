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
		this.document = options.document || elementor.documents.getCurrent();

		elementor.on( 'document:loaded', ( document ) => {
			this.setMenuItems( document );
			this.setLastEdited( document.config.last_edited );
		} );

		// TODO: Temp, footerSaver should be removed.
		$e.components.get( 'document/save' ).footerSaver = this;
	}

	activateSaveButtons( document, status ) {
		const hasChanges = status || 'draft' === document.container.settings.get( 'post_status' );

		this.ui.buttonPublish.add( this.ui.menuSaveDraft ).toggleClass( 'elementor-disabled', ! hasChanges );
		this.ui.buttonSaveOptions.toggleClass( 'elementor-disabled', ! hasChanges );
	}

	onRender() {
		this.addTooltip();
	}

	setLastEdited( lastEdited ) {
		this.ui.lastEditedWrapper
			.removeClass( 'elementor-button-state' )
			.find( '.elementor-last-edited' )
			.html( lastEdited );
	}

	onClickButtonPreview() {
		$e.run( 'editor/documents/preview', { id: elementor.documents.getCurrent().id } );
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

	setMenuItems( document ) {
		const postStatus = document.container.settings.get( 'post_status' ),
			translationMap = {
				publish: __( 'Publish', 'elementor' ),
				update: __( 'Update', 'elementor' ),
				submit: __( 'Submit', 'elementor' ),
			};

		let publishLabel = 'publish';

		switch ( postStatus ) {
			case 'publish':
			case 'private':
				publishLabel = 'update';

				if ( document.config.revisions.current_id !== document.id ) {
					this.activateSaveButtons( document, true );
				}

				break;
			case 'draft':
				if ( ! document.config.user.can_publish ) {
					publishLabel = 'submit';
				}

				this.activateSaveButtons( document, true );
				break;
			case 'pending': // User cannot change post status
			case undefined: // TODO: as a contributor it's undefined instead of 'pending'.
				if ( ! document.config.user.can_publish ) {
					publishLabel = 'update';
				}
				break;
		}

		this.ui.buttonPublishLabel.html( translationMap[ publishLabel ] );
	}

	addTooltip() {
		// Create tooltip on controls
		this.$el.find( '.tooltip-target' ).each( ( index, button ) => {
			const $button = jQuery( button );

			$button.tipsy( {
				// `n` for down, `s` for up
				gravity: 's',
				offset: $button.data( 'tooltip-offset' ),
				title() {
					return this.getAttribute( 'data-tooltip' );
				},
			} );
		} );
	}

	// TODO: Consider $e.internal( 'editor/documents/preview-refresh' ); ?.
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
