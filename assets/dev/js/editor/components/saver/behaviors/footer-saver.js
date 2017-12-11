module.exports = Marionette.Behavior.extend( {
	previewWindow: null,

	ui: function() {
		return {
			buttonSave: '#elementor-panel-saver-button-save',
			buttonSaveLabel: '#elementor-panel-saver-save-label',
			buttonPublish: '#elementor-panel-saver-button-publish',
			buttonPreview: '#elementor-panel-saver-button-preview',
			menuUpdate: '#elementor-panel-saver-menu-update',
			menuPublish: '#elementor-panel-saver-menu-publish',
			menuPublishChanges: '#elementor-panel-saver-menu-publish-changes',
			menuSubmitForReview: '#elementor-panel-saver-menu-submit-for-review'
		};
	},

	events: function() {
		return {
			'click @ui.buttonSave': 'onClickButtonSave',
			'click @ui.buttonPreview': 'onClickButtonPreview',
			'click @ui.menuUpdate': 'onClickMenuUpdate',
			'click @ui.menuPublish': 'onClickMenuPublish',
			'click @ui.menuPublishChanges': 'onClickMenuPublish',
			'click @ui.menuSubmitForReview': 'onClickMenuSubmitForReview'
		};
	},

	initialize: function() {
		elementor.saver
			.on( 'before:save', this.onBeforeSave.bind( this ) )
			.on( 'after:save', this.onAfterSave.bind( this ) )
			.on( 'after:save:publish', this.onAfterPublished.bind( this ) )
			.on( 'after:saveError', this.onAfterSaveError.bind( this ) );

		elementor.channels.editor.on( 'status:change', this.activateSaveButton.bind( this ) );

		elementor.settings.page.model.on( 'change', this.onPostStatusChange.bind( this ) );
	},

	onRender: function() {
		this.setMenuItems( elementor.settings.page.model.get( 'post_status' ) );
		this.addTooltip();
	},

	onPostStatusChange: function( settings ) {
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

	onBeforeSave: function() {
		NProgress.start();
		this.ui.buttonSave.addClass( 'elementor-button-state' );
	},

	onAfterSave: function() {
		NProgress.done();
		this.ui.buttonSave.removeClass( 'elementor-button-state' );
		this.refreshWpPreview();
	},

	onAfterSaveError: function() {
		NProgress.done();
		this.ui.buttonSave.removeClass( 'elementor-button-state' );
	},

	onClickButtonSave: function() {
		elementor.saver.doAutoSave();
	},

	onClickButtonPreview: function() {
		// Open immediately in order to avoid popup blockers.
		this.previewWindow = window.open( elementor.config.wp_preview.url, elementor.config.wp_preview.target );

		if ( elementor.saver.isEditorChanged() ) {
			// Force save even if it's saving now.
			if ( elementor.saver.isSaving ) {
				elementor.saver.isSaving = false;
			}

			elementor.saver.doAutoSave();
		}
	},

	onClickMenuUpdate: function() {
		elementor.saver.update();
	},

	onClickMenuPublish: function() {
		elementor.saver.publish();
	},

	onClickMenuSubmitForReview: function() {
		elementor.saver.savePending();
	},

	onAfterPublished: function() {
		this.ui.menuPublishChanges.find( '.elementor-title' ).html( elementor.translate( 'published' ) );
	},

	activateSaveButton: function( hasChanges ) {
		if ( hasChanges ) {
			this.ui.buttonSave.addClass( 'elementor-save-active' );
			this.ui.buttonSaveLabel.html( elementor.translate( 'save' ) );
			this.ui.menuPublishChanges.find( '.elementor-title' )
				.addClass( 'elementor-save-active' )
				.html( elementor.translate( 'publish_changes' ) );
		} else {
			this.ui.buttonSave.removeClass( 'elementor-save-active' );
			this.ui.buttonSaveLabel.html( elementor.translate( 'saved' ) );
			this.ui.menuPublishChanges.find( '.elementor-title' )
				.removeClass( 'elementor-save-active' );
		}
	},

	setMenuItems: function( postStatus ) {
		this.ui.menuPublish.hide();
		this.ui.menuPublishChanges.hide();
		this.ui.menuUpdate.hide();
		this.ui.menuSubmitForReview.hide();

		switch ( postStatus ) {
			case 'publish':
				this.ui.menuPublishChanges.show();
				break;
			case 'private':
				this.ui.menuUpdate.show();
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
