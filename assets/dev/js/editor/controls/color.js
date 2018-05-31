var ControlBaseDataView = require( 'elementor-controls/base-data' ),
	ControlColorItemView;

ControlColorItemView = ControlBaseDataView.extend( {
	applySavedValue: function() {
		ControlBaseDataView.prototype.applySavedValue.apply( this, arguments );

		var self = this,
			value = self.getControlValue(),
			colorInstance = self.ui.input.wpColorPicker( 'instance' );

		if ( colorInstance ) {
			self.ui.input.wpColorPicker( 'color', value );

			if ( ! value ) {
				// Trigger `change` event manually, since it will not be triggered automatically on empty value
				self.ui.input.data( 'a8cIris' )._change();
			}
		} else {
			elementor.helpers.wpColorPicker( self.ui.input, {
				change: function() {
					self.ui.input.val( self.ui.input.wpColorPicker( 'color' ) ).trigger( 'input' );
				},
				clear: function() {
					self.setValue( '' );
				}
			} );
		}
	},

	onBeforeDestroy: function() {
		if ( this.ui.input.wpColorPicker( 'instance' ) ) {
			this.ui.input.wpColorPicker( 'close' );
		}

		this.$el.remove();
	}
} );

module.exports = ControlColorItemView;
