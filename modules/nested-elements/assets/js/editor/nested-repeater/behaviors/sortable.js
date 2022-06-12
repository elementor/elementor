import SortableBase from 'elementor-behaviors/sortable';

export default class Sortable extends SortableBase {
	moveChild( childView, index ) {
		super.moveChild( childView, index );

		// Since, Nested handlers rearrange the containers(`e-container`) its require to trigger `onInit` on frontend handler.
		this.view.render();
	}
}
