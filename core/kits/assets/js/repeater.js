import Repeater from '../../../../assets/dev/js/editor/controls/repeater';
import RepeaterRow from './repeater-row';

export default class extends Repeater {
	constructor( ...args ) {
		super( ...args );

		this.childView = RepeaterRow;
	}

	templateHelpers() {
		const templateHelpers = super.templateHelpers();

		templateHelpers.addButtonText = elementor.translate( 'custom_colors' === this.model.get( 'name' ) ? 'add_color' : 'add_style' );

		return templateHelpers;
	}

	getDefaults() {
		const defaults = super.getDefaults();

		defaults.title = `${ elementor.translate( 'new_item' ) } #${ this.children.length + 1 }`;

		return defaults;
	}
}
