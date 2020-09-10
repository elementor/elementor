import Repeater from '../../../../assets/dev/js/editor/controls/repeater';
import RepeaterRow from './repeater-row';

export default class extends Repeater {
	constructor( ...args ) {
		super( ...args );

		this.childView = RepeaterRow;
	}

	templateHelpers() {
		const templateHelpers = super.templateHelpers();

		templateHelpers.addButtonText = sprintf( __( 'Add %s', 'elementor' ), 'custom_colors' === this.model.get( 'name' ) ? 'Color' : 'Style' );

		return templateHelpers;
	}

	getDefaults() {
		const defaults = super.getDefaults();

		defaults.title = `${ __( 'New Item', 'elementor' ) } #${ this.children.length + 1 }`;

		return defaults;
	}
}
