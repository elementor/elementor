import Repeater from '../../../../assets/dev/js/editor/controls/repeater';
import RepeaterRow from './repeater-row';

export default class extends Repeater {
	constructor( ...args ) {
		super( ...args );

		this.childView = RepeaterRow;
	}

	templateHelpers() {
		const templateHelpers = super.templateHelpers();

		templateHelpers.addButtonText = 'custom_colors' === this.model.get( 'name' ) ? __( 'Add Color', 'elementor' ) : __( 'Add Style', 'elementor' );

		return templateHelpers;
	}

	getDefaults() {
		const defaults = super.getDefaults();

		defaults.title = `${ __( 'New Item', 'elementor' ) } #${ this.children.length + 1 }`;

		return defaults;
	}
}
