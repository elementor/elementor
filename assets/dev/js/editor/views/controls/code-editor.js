var ControlBaseItemView = require( 'elementor-views/controls/base' ),
	ControlCodeEditorItemView;

ControlCodeEditorItemView = ControlBaseItemView.extend( {
	ui: function() {
		var ui = ControlBaseItemView.prototype.ui.apply( this, arguments );

		ui.editor = '.elementor-code-editor';

		return ui;
	},

	onReady: function() {
		var self = this;

		if ( ! ace || ! self.model.attributes.use_advanced_editor ) {
			return;
		}

		self.editor = ace.edit( this.ui.editor[0] );

		Backbone.$( self.editor.container ).addClass( 'elementor-input-style elementor-code-editor' );

		self.editor.setOptions({
			mode: 'ace/mode/' + self.model.attributes.language,
			minLines: 10,
			maxLines: Infinity,
			showGutter: true,
			useWorker: true
		});

		self.editor.setValue( self.getControlValue(), -1 ); // -1 =  move cursor to the start

		self.editor.on( 'change', function () {
			self.setValue( self.editor.getValue() );
		});
	}
} );

module.exports = ControlCodeEditorItemView;
