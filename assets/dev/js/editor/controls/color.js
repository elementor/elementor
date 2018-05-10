var ControlBaseDataView = require( 'elementor-controls/base-data' ),
	ControlColorItemView;

ControlColorItemView = ControlBaseDataView.extend( {
	applySavedValue: function() {
		if ( this.ui.input.wpColorPicker( 'instance' ) ) {
			this.ui.input.wpColorPicker( 'color', this.getControlValue() );
		}
	},

	onReady: function() {
		var self = this;

		elementor.helpers.wpColorPicker( self.ui.input, {
			change: function() {
				self.ui.input.val( self.ui.input.wpColorPicker( 'color' ) ).trigger( 'input' );
			},
			clear: function() {
				self.setValue( '' );
			}
		} );
	},

	onBeforeDestroy: function() {
		if ( this.ui.input.wpColorPicker( 'instance' ) ) {
			this.ui.input.wpColorPicker( 'close' );
		}

		this.$el.remove();
	}
} );

module.exports = ControlColorItemView;
