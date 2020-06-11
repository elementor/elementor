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

	onButtonAddRowClick() {
		super.onButtonAddRowClick();

		// Get the text input for the new global
		const rowView = this.children.last(),
			textControlView = rowView.children.findByModel( rowView.collection.findWhere( { type: 'text' } ) );

		textControlView.ui.input.val( `${ elementor.translate( 'new_item' ) } #${ rowView.itemIndex }` );
	}
}
