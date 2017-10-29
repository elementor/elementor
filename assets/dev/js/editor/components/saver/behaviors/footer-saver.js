module.exports = Marionette.Behavior.extend( {
	ui: {
		buttonDone: '#elementor-panel-saver-done',
		buttonDoneIcon: '#elementor-panel-saver-done-icon',
		buttonSaveDraft: '#elementor-panel-saver-save-draft',
		buttonUpdate: '#elementor-panel-saver-update',
		buttonPreview: '#elementor-panel-saver-preview span',
		buttonPublish: '#elementor-panel-saver-publish',
		buttonPublishTitle: '#elementor-panel-saver-publish .elementor-title',
		formPreview: '#elementor-panel-saver-preview form',
		lastEdit: '#elementor-panel-saver-last-save'
	},

	events: {
		'click @ui.buttonSaveDraft': 'onClickButtonSaveDraft',
		'click @ui.buttonUpdate': 'onClickButtonUpdate',
		'click @ui.buttonPublish': 'onClickButtonPublish',
		'click @ui.buttonPreview': 'onClickButtonPreview'
	},

	initialize: function() {
		elementor.saver.on( 'before:save', _.bind( this.onBeforeSave, this ) );
		elementor.saver.on( 'after:save', _.bind( this.onAfterSave, this ) );

		elementor.channels.editor.on( 'status:change', _.bind( this.removeDoneIcon, this ) );

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
		this.ui.buttonDone.addClass( 'elementor-button-state' );
		this.ui.buttonDoneIcon.hide();
	},

	onAfterSave: function() {
		NProgress.done();
		this.ui.buttonDone.removeClass( 'elementor-button-state' );
		this.ui.buttonDoneIcon.show();
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

	removeDoneIcon: function() {
		this.ui.buttonDoneIcon.hide();
	},

	showButtons: function( postStatus ) {
		if ( 'publish' === postStatus ) {
			this.ui.buttonSaveDraft.hide();
			this.ui.buttonPublish.hide();
			this.ui.buttonUpdate.show();
		} else {
			this.ui.buttonSaveDraft.show();
			this.ui.buttonPublish.show();
			this.ui.buttonUpdate.hide();
		}
	}
} );
