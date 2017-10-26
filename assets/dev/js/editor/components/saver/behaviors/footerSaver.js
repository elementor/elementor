module.exports = Marionette.Behavior.extend( {
	ui: {
		buttonDone: '#elementor-panel-saver-done',
		buttonSaveDraft: '#elementor-panel-saver-save-draft',
		buttonUpdate: '#elementor-panel-saver-update',
		buttonPublish: '#elementor-panel-saver-publish',
		buttonPublishTitle: '#elementor-panel-saver-publish .elementor-title',
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
		this.ui.lastEdit.html( elementor.translate( 'saving' ) + '...' );
	},

	onAfterSave: function( data ) {
		NProgress.done();
		var saveNote = '';
		if ( data.last_edited ) {
			saveNote = data.last_edited;
		}

		this.ui.lastEdit.html( saveNote );
	},

	onClickButtonSaveDraft: function() {
		elementor.saver.update( );
	},

	onClickButtonUpdate: function() {
		elementor.saver.update();
	},

	onClickButtonPublish: function() {
		elementor.saver.publish();
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
