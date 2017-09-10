var ControlBaseView = require( 'elementor-views/controls/base' ),
	ControlNumberItemView;

ControlNumberItemView = ControlBaseView.extend( {
	correctionTimeOut: 0,

	getInputValue: function( input ) {
		var self = this,
			inputValue = ControlBaseView.prototype.getInputValue.apply( self, arguments ),
			validValue = inputValue,
			min = self.model.get( 'min' ),
			max = self.model.get( 'max' );

		if ( ! _.isFinite( inputValue ) && self.model.get( 'nullable' ) ) {
			return inputValue;
		}

		if ( _.isFinite( min ) && inputValue < min ) {
			validValue = min;
		}

		if ( _.isFinite( max ) && inputValue > max ) {
			validValue = max;
		}

		return validValue;
	},

	updateElementModel: function( value, input ) {
		var self = this,
			originalInputValue = ControlBaseView.prototype.getInputValue.call( self, input );

		if ( originalInputValue !== value ) {
			self.correctionTimeOut = setTimeout( function() {
				self.setInputValue( input, value );
			}, 1200 );
		}

		ControlBaseView.prototype.updateElementModel.apply( this, arguments );
	},

	onBaseInputChange: function() {
		if ( this.correctionTimeOut ) {
			clearTimeout( this.correctionTimeOut );
		}

		ControlBaseView.prototype.onBaseInputChange.apply( this, arguments );
	}
} );

module.exports = ControlNumberItemView;
