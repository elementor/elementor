module.exports = Marionette.Behavior.extend( {
	previewWindow: null,

	ui: function() {
		return {
			buttonSave: '#elementor-panel-saver-button-save',
			buttonSaveLabel: '#elementor-panel-saver-save-label',
			buttonPublish: '#elementor-panel-saver-button-publish',
			buttonPreview: '#elementor-panel-saver-button-preview-label',
			menuUpdate: '#elementor-panel-saver-menu-update',
			menuPublish: '#elementor-panel-saver-menu-publish',
			menuPublishChanges: '#elementor-panel-saver-menu-publish-changes'
		};
	},

	events: function() {
		return {
			'click @ui.buttonSave': 'onClickButtonSave',
			'click @ui.buttonPreview': 'onClickButtonPreview',
			'click @ui.menuUpdate': 'onClickMenuUpdate',
			'click @ui.menuPublish': 'onClickMenuPublish',
			'click @ui.menuPublishChanges': 'onClickMenuPublish'
		};
	},

	initialize: function() {
		elementor.saver.on( 'before:save', this.onBeforeSave.bind( this ) );
		elementor.saver.on( 'after:save', this.onAfterSave.bind( this ) );

		elementor.channels.editor.on( 'status:change', this.activateSaveButton.bind( this ) );

		elementor.settings.page.model.on( 'change', this.onPostStatusChange.bind( this ) );
	},

	onRender: function() {
		this.setMenuItems( elementor.settings.page.model.get( 'post_status' ) );
	},

	onPostStatusChange: function( settings ) {
		var changed = settings.changed;

		if ( ! _.isUndefined( changed.post_status ) ) {
			this.setMenuItems( changed.post_status );
		}
	},

	onBeforeSave: function() {
		NProgress.start();
		this.ui.buttonSave.addClass( 'elementor-button-state' );
	},

	onAfterSave: function() {
		NProgress.done();
		this.ui.buttonSave.removeClass( 'elementor-button-state' );
		// If the this.previewWindow is not null and not closed.
		if ( this.previewWindow && this.previewWindow.location.reload ) {
			this.previewWindow.location.reload();
		}
	},

	onClickButtonSave: function() {
		elementor.saver.doAutoSave();
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

	onClickMenuUpdate: function() {
		elementor.saver.update();
	},

	onClickMenuPublish: function() {
		elementor.saver.publish();
	},

	activateSaveButton: function( hasChanges ) {
		if ( hasChanges ) {
			this.ui.buttonSave.addClass( 'elementor-save-active' );
			this.ui.buttonSaveLabel.html( elementor.translate( 'save' ) );
		} else {
			this.ui.buttonSave.removeClass( 'elementor-save-active' );
			this.ui.buttonSaveLabel.html( elementor.translate( 'saved' ) );
		}
	},

	setMenuItems: function( postStatus ) {
		if ( 'publish' === postStatus || 'private' === postStatus ) {
			this.ui.menuPublish.hide();
			this.ui.menuUpdate.toggle( 'private' === postStatus );
			this.ui.menuPublishChanges.toggle( 'publish' === postStatus );
		} else {
			this.ui.menuPublish.show();
			this.ui.menuUpdate.hide();
			this.ui.menuPublishChanges.hide();
		}
	}
} );
