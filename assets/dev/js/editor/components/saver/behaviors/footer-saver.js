module.exports = Marionette.Behavior.extend( {
	previewWindow: null,

	ui: function() {
		return {
			buttonUpdate: '#elementor-panel-saver-button-update',
			buttonPreview: '#elementor-panel-saver-button-preview',
			menuPublish: '#elementor-panel-saver-menu-publish',
			menuUpdate: '#elementor-panel-saver-menu-update',
			menuDiscard: '#elementor-panel-saver-menu-discard',
			menuSaveDraft: '#elementor-panel-saver-menu-save-draft',
			menuSubmitForReview: '#elementor-panel-saver-menu-submit-for-review'
		};
	},

	events: function() {
		return {
			'click @ui.buttonPreview': 'onClickButtonPreview',
			'click @ui.menuPublish': 'onClickMenuPublish',
			'click @ui.menuUpdate': 'onClickMenuUpdate',
			'click @ui.menuSaveDraft': 'onClickMenuSaveDraft',
			'click @ui.menuDiscard': 'onClickMenuDiscard',
			'click @ui.menuSubmitForReview': 'onClickMenuSubmitForReview'
		};
	},

	initialize: function() {
		elementor.saver
			.on( 'before:save', this.onBeforeSave.bind( this ) )
			.on( 'after:save', this.onAfterSave.bind( this ) )
			.on( 'after:save:publish', this.onAfterPublish.bind( this ) )
			.on( 'after:save:private', this.onAfterPublish.bind( this ) )
			.on( 'after:saveError', this.onAfterSaveError.bind( this ) );

		elementor.settings.document.model.on( 'change', this.onPostStatusChange.bind( this ) );
	},

	onRender: function() {
		this.setMenuItems( elementor.settings.document.model.get( 'post_status' ) );
		this.addTooltip();
	},

	onPostStatusChange: function( settings ) {
		var changed = settings.changed;

		if ( ! _.isUndefined( changed.post_status ) ) {
			this.setMenuItems( changed.post_status );

			this.refreshWpPreview();

			// Refresh page-settings post-status value.
			if ( 'document_settings' === elementor.getPanelView().getCurrentPageName() ) {
				elementor.getPanelView().getCurrentPageView().render();
			}
		}
	},

	onBeforeSave: function() {
		NProgress.start();
		this.ui.buttonUpdate.addClass( 'elementor-button-state' );
	},

	onAfterSave: function() {
		NProgress.done();
		this.ui.buttonUpdate.removeClass( 'elementor-button-state' );
		this.refreshWpPreview();
	},

	onAfterPublish: function() {
		elementor.saver.setFlagEditorChange( false );
		location.href = elementor.config.wp_preview.url;
	},

	onAfterSaveError: function() {
		NProgress.done();
		this.ui.buttonSave.removeClass( 'elementor-button-state' );
	},

	onClickButtonPreview: function() {
		// Open immediately in order to avoid popup blockers.
		this.previewWindow = window.open( elementor.config.wp_preview.url, elementor.config.wp_preview.target );

		if ( elementor.saver.isEditorChanged() ) {
			if ( elementor.saver.xhr ) {
				elementor.saver.xhr.abort();
				elementor.saver.isSaving = false;
			}

			elementor.saver.doAutoSave();
		}
	},

	onClickMenuPublish: function() {
		elementor.saver.publish();
	},

	onClickMenuUpdate: function() {
		elementor.saver.update();
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

	onClickMenuSubmitForReview: function() {
		elementor.saver.savePending();
	},

	setMenuItems: function( postStatus ) {
		this.ui.menuPublish.hide();
		this.ui.menuUpdate.hide();
		this.ui.menuSubmitForReview.hide();

		switch ( postStatus ) {
			case 'publish':
				this.ui.menuPublish.show();
				this.ui.menuDiscard.show();
				break;
			case 'private':
				this.ui.menuUpdate.show();
				this.ui.menuDiscard.show();
				break;
			case 'draft':
				if ( elementor.config.current_user_can_publish ) {
					this.ui.menuPublish.show();
				}
				break;
			case 'pending': // User cannot change post status
			case undefined: // TODO: as a contributor it's undefined instead of 'pending'.
				if ( elementor.config.current_user_can_publish ) {
					this.ui.menuPublish.show();
				} else {
					this.ui.menuSubmitForReview.show();
				}
				break;
		}
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
