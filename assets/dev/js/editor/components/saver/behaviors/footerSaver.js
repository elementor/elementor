/**
 * TODO:
 * elementor-pro/modules/global-widget/assets/js/editor/editor.js:139 setSaveButton
 * elementor/assets/dev/js/editor/editor.js:341 elementor.getPanelView().getFooterView()._publishBuilder()
 *
 */
module.exports = Marionette.Behavior.extend( {
	savedDialog: null,

	ui: {
		buttonDone: '#elementor-panel-saver-done',
		buttonSaveDraft: '#elementor-panel-saver-save-draft',
		buttonUpdate: '#elementor-panel-saver-update',
		buttonPublish: '#elementor-panel-saver-publish',
		lastEdit: '#elementor-panel-saver-last-save'
	},

	events: {
		'click @ui.buttonSaveDraft': 'onClickButtonSaveDraft',
		'click @ui.buttonUpdate': 'onClickButtonUpdate',
		'click @ui.buttonPublish': 'onClickButtonPublish'
	},

	initialize: function() {
		this.listenTo( elementor.channels.editor, 'status:change', this.onEditorChanged );

		elementor.saver.on( 'before:save', _.bind( this.onBeforeSave, this ) );
		elementor.saver.on( 'after:save', _.bind( this.onAfterSave, this ) );
	},

	onBeforeSave: function() {
		NProgress.start();
	},

	onAfterSave: function( data ) {
		NProgress.done();

		if ( data.last_edited ) {
			this.ui.lastEdit.html( data.last_edited );
		}
	},

	onEditorChanged: function() {
		this.ui.buttonDone.toggleClass( 'elementor-save-active', elementor.saver.isEditorChanged() );
	},

	onClickButtonSaveDraft: function() {
		elementor.saver.saveDraft( );
	},

	onClickButtonUpdate: function() {
		elementor.saver.update();
	},

	onClickButtonPublish: function() {
		elementor.saver.publish();
	}
} );
