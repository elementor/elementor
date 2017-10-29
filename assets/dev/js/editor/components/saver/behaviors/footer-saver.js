module.exports = Marionette.Behavior.extend( {
	ui: {
		buttonSave: '#elementor-panel-saver-save',
		buttonSaveIcon: '#elementor-panel-saver-save-icon',
		buttonSaveDraft: '#elementor-panel-saver-save-draft',
		buttonUpdate: '#elementor-panel-saver-update',
		buttonPreview: '#elementor-panel-saver-preview span',
		buttonPublish: '#elementor-panel-saver-publish',
		buttonPublishChanges: '#elementor-panel-saver-publish-changes',
		formPreview: '#elementor-panel-saver-preview form'
	},

	events: {
		'click @ui.buttonSaveDraft': 'onClickButtonSaveDraft',
		'click @ui.buttonUpdate': 'onClickButtonUpdate',
		'click @ui.buttonPublish': 'onClickButtonPublish',
		'click @ui.buttonPublishChanges': 'onClickButtonPublish',
		'click @ui.buttonPreview': 'onClickButtonPreview'
	},

	initialize: function() {
		elementor.saver.on( 'before:save', _.bind( this.onBeforeSave, this ) );
		elementor.saver.on( 'after:save', _.bind( this.onAfterSave, this ) );

		elementor.channels.editor.on( 'status:change', _.bind( this. removeSavedIcon, this ) );

		elementor.settings.page.model.on( 'change', _.bind( this.onPostStatusChange, this ) );
	},

	onRender: function() {
		this.showButtons( elementor.settings.page.model.get( 'post_status' ) );
	},

	onPostStatusChange: function( settings ) {
		var changed = settings.changed;

		if ( ! ( _.isUndefined( changed.post_status ) ) ) {
			this.showButtons( changed.post_status );
		}
	},

	onBeforeSave: function() {
		NProgress.start();
		this.ui.buttonSave.addClass( 'elementor-button-state' );
		this.ui.buttonSaveIcon.hide();
	},

	onAfterSave: function() {
		NProgress.done();
		this.ui.buttonSave.removeClass( 'elementor-button-state' );
		this.ui.buttonSaveIcon.show();
	},

	onClickButtonPreview: function( event ) {
		event.preventDefault();

		var self = this,
			submit = function() {
				self.ui.formPreview.submit();
			};

		if ( elementor.saver.isEditorChanged() ) {
			elementor.saver.saveAutoSave( {
				onSuccess: submit
			} );
		} else {
			submit();
		}
	},

	onClickButtonSaveDraft: function() {
		elementor.saver.update();
	},

	onClickButtonUpdate: function() {
		elementor.saver.update();
	},

	onClickButtonPublish: function() {
		elementor.saver.publish();
	},

	 removeSavedIcon: function() {
		this.ui.buttonSaveIcon.hide();
	},

	showButtons: function( postStatus ) {
		if ( 'publish' === postStatus || 'private' === postStatus ) {
			this.ui.buttonSaveDraft.hide();
			this.ui.buttonPublish.hide();
			this.ui.buttonUpdate.toggle( 'private' === postStatus );
			this.ui.buttonPublishChanges.toggle( 'publish' === postStatus );
		} else {
			this.ui.buttonSaveDraft.show();
			this.ui.buttonPublish.show();
			this.ui.buttonUpdate.hide();
			this.ui.buttonPublishChanges.hide();
		}
	}
} );
