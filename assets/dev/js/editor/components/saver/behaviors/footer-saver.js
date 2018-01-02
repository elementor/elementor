module.exports = Marionette.Behavior.extend( {
	previewWindow: null,

	ui: function() {
		return {
			buttonPreview: '#elementor-panel-saver-button-preview',
			buttonPublish: '#elementor-panel-saver-button-publish',
			buttonPublishLabel: '#elementor-panel-saver-button-publish-label',
			menuDiscard: '#elementor-panel-saver-menu-discard',
			menuSaveDraft: '#elementor-panel-saver-menu-save-draft',
			lastEdited: '.elementor-last-edited'
		};
	},

	events: function() {
		return {
			'click @ui.buttonPreview': 'onClickButtonPreview',
			'click @ui.buttonPublish': 'onClickButtonPublish',
			'click @ui.menuSaveDraft': 'onClickMenuSaveDraft',
			'click @ui.menuDiscard': 'onClickMenuDiscard'
		};
	},

	initialize: function() {
		elementor.saver
			.on( 'before:save', this.onBeforeSave.bind( this ) )
			.on( 'after:save', this.onAfterSave.bind( this ) )
			.on( 'after:saveError', this.onAfterSaveError.bind( this ) )
			.on( 'page:status:change', this.onPageStatusChange );

		elementor.settings.page.model.on( 'change', this.onPageSettingsChange.bind( this ) );
	},

	onRender: function() {
		this.setMenuItems( elementor.settings.page.model.get( 'post_status' ) );
		this.addTooltip();
	},

	onPageSettingsChange: function( settings ) {
		var changed = settings.changed;

		if ( ! _.isUndefined( changed.post_status ) ) {
			this.setMenuItems( changed.post_status );

			this.refreshWpPreview();

			// Refresh page-settings post-status value.
			if ( 'page_settings' === elementor.getPanelView().getCurrentPageName() ) {
				elementor.getPanelView().getCurrentPageView().render();
			}
		}
	},

	onPageStatusChange: function( newStatus ) {
		if ( 'publish' === newStatus ) {
			elementor.notifications.showToast( {
				message: elementor.translate( 'publish_notification' ),
				buttons: [
					{
						name: 'view_page',
						text: elementor.translate( 'have_a_look' ),
						callback: function() {
							open( elementor.config.post_link );
						}
					}
				]
			} );
		}
	},

	onBeforeSave: function( options ) {
		NProgress.start();
		if ( 'autosave' === options.status ) {
			this.ui.lastEdited.addClass( 'elementor-state-active' );
		} else {
			this.ui.buttonPublish.addClass( 'elementor-button-state' );
		}
	},

	onAfterSave: function( data ) {
		NProgress.done();
		this.ui.buttonPublish.removeClass( 'elementor-button-state' );
		this.ui.lastEdited.removeClass( 'elementor-state-active' );
		this.refreshWpPreview();
		this.setLastEdited( data );
	},

	setLastEdited: function( data ) {
		this.ui.lastEdited
			.removeClass( 'elementor-button-state' )
			.html( data.config.last_edited );
	},

	onAfterSaveError: function() {
		NProgress.done();
		this.ui.buttonSave.removeClass( 'elementor-button-state' );
	},

	onClickButtonPreview: function() {
		// Open immediately in order to avoid popup blockers.
		this.previewWindow = open( elementor.config.wp_preview.url, elementor.config.wp_preview.target );

		if ( elementor.saver.isEditorChanged() ) {
			if ( elementor.saver.xhr ) {
				elementor.saver.xhr.abort();
				elementor.saver.isSaving = false;
			}

			elementor.saver.doAutoSave();
		}
	},

	onClickButtonPublish: function() {
		var postStatus = elementor.settings.page.model.get( 'post_status' );
		switch ( postStatus ) {
			case 'publish':
			case 'private':
				elementor.saver.update();
				break;
			case 'draft':
				if ( elementor.config.current_user_can_publish ) {
					elementor.saver.publish();
				} else {
					elementor.saver.savePending();
				}
				break;
			case 'pending': // User cannot change post status
			case undefined: // TODO: as a contributor it's undefined instead of 'pending'.
				if ( elementor.config.current_user_can_publish ) {
					elementor.saver.publish();
				} else {
					elementor.saver.update();
				}
				break;
		}
	},

	onClickMenuSaveDraft: function() {
		elementor.saver.saveAutoSave( {
			onSuccess: function() {
				location.href = elementor.config.exit_to_dashboard_url;
			}
		} );
	},

	onClickMenuDiscard: function() {
		elementor.saver.discard();
	},

	setMenuItems: function( postStatus ) {
		var publishLabel = 'publish';
		this.ui.menuDiscard.hide();

		switch ( postStatus ) {
			case 'publish':
			case 'private':
				this.ui.menuDiscard.show();
				publishLabel = 'update';
				break;
			case 'draft':
				if ( ! elementor.config.current_user_can_publish ) {
					publishLabel = 'submit';
				}
				break;
			case 'pending': // User cannot change post status
			case undefined: // TODO: as a contributor it's undefined instead of 'pending'.
				if ( ! elementor.config.current_user_can_publish ) {
					publishLabel = 'update';
				}
				break;
		}

		this.ui.buttonPublishLabel.html( elementor.translate( publishLabel ) );
	},

	addTooltip: function() {
		// Create tooltip on controls
		this.$el.find( '.tooltip-target' ).tipsy( {
			// `n` for down, `s` for up
			gravity: 's',
			title: function() {
				return this.getAttribute( 'data-tooltip' );
			}
		} );
	},

	refreshWpPreview: function() {
		// If the this.previewWindow is not null and not closed.
		if ( this.previewWindow && this.previewWindow.location.reload ) {
			// Refresh URL form updated config.
			this.previewWindow.location = elementor.config.wp_preview.url;
		}
	}
} );
