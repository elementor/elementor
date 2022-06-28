import { elementsSelection } from 'elementor-document/elements/selectors';

export class DeselectAll extends $e.modules.CommandBase {
	apply( args ) {
		$e.store.dispatch(
			this.component.store( 'selection' ).actions.deselectAll(),
		);

		elementsSelection.getContainers().forEach( ( container ) => container.view.deselect() );
	}

	static reducer() {
		return [];
	}
}

export default DeselectAll;
