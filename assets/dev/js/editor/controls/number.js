var ControlBaseDataView = require( 'elementor-controls/base-data' ),
	ControlNumberItemView;

ControlNumberItemView = ControlBaseDataView.extend( {
	correctionTimeOut: 0,

	getInputValue: function( input ) {
		var self = this,
			inputValue = ControlBaseDataView.prototype.getInputValue.apply( self, arguments ),
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
			originalInputValue = ControlBaseDataView.prototype.getInputValue.call( self, input );

		if ( originalInputValue !== value ) {
			self.correctionTimeOut = setTimeout( function() {
				self.setInputValue( input, value );
			}, 1200 );
		}

		ControlBaseDataView.prototype.updateElementModel.apply( this, arguments );
	},

	onBaseInputChange: function() {
		if ( this.correctionTimeOut ) {
			clearTimeout( this.correctionTimeOut );
		}

		ControlBaseDataView.prototype.onBaseInputChange.apply( this, arguments );
	}
} );

module.exports = ControlNumberItemView;
