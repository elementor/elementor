import Switcher from '../../../../assets/dev/js/editor/controls/switcher';
import ControlBaseDataView from 'elementor-controls/base-data';

export default class extends Switcher {
	initialize() {
		ControlBaseDataView.prototype.initialize.apply( this, arguments );

		this.$el.addClass( 'elementor-control-type-switcher' );
	}

	onBaseInputChange( event ) {
		ControlBaseDataView.prototype.onBaseInputChange.apply( this, arguments );

		var input = event.currentTarget,
			value = this.getInputValue( input );

		if ( this.model.get( 'on_change_command' ) ) {
			this.runCommand( value );
		}
	}

	runCommand( value ) {
		$e.run( this.model.get( 'on_change_command' ), { value } );
	}
}
