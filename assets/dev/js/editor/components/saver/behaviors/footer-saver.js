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

	initialize() {
		/**
		 * @type {Component}
		 */
		this.saver = $e.components.get( 'document/save' );

		this.saver
			.on( 'before:save', this.onBeforeSave.bind( this ) )
			.on( 'after:save', this.onAfterSave.bind( this ) )
			.on( 'after:saveError', this.onAfterSaveError.bind( this ) )
			.on( 'page:status:change', this.onPageStatusChange );

		elementor.on( 'document:loaded', () => {
			elementor.settings.page.model.on( 'change', this.onPageSettingsChange.bind( this ) );
			this.setMenuItems( elementor.settings.page.model.get( 'post_status' ) );
			this.setLastEdited( elementor.config.document.last_edited );
		} );

		elementor.channels.editor.on( 'status:change', this.activateSaveButtons.bind( this ) );
	}

	activateSaveButtons( hasChanges ) {
		hasChanges = hasChanges || 'draft' === elementor.settings.page.model.get( 'post_status' );

		this.ui.buttonPublish.add( this.ui.menuSaveDraft ).toggleClass( 'elementor-disabled', ! hasChanges );
		this.ui.buttonSaveOptions.toggleClass( 'elementor-disabled', ! hasChanges );
	}

	onRender() {
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

	onBeforeSave( options ) {
		NProgress.start();
		if ( 'autosave' === options.status ) {
			this.ui.lastEditedWrapper.addClass( 'elementor-state-active' );
		} else {
			this.ui.buttonPublish.addClass( 'elementor-button-state' );
		}
	}

	onAfterSave( data ) {
		NProgress.done();
		this.ui.buttonPublish.removeClass( 'elementor-button-state' );
		this.ui.lastEditedWrapper.removeClass( 'elementor-state-active' );
		this.refreshWpPreview();
		this.setLastEdited( data.config.document.last_edited );
	}

	setLastEdited( lastEdited ) {
		this.ui.lastEditedWrapper
			.removeClass( 'elementor-button-state' )
			.find( '.elementor-last-edited' )
			.html( lastEdited );
	}

	onAfterSaveError() {
		NProgress.done();
		this.ui.buttonPublish.removeClass( 'elementor-button-state' );
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
