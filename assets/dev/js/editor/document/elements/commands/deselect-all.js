import { elementsSelection } from 'elementor-document/elements/selectors';

export class DeselectAll extends $e.modules.CommandBase {
	apply() {
		$e.store.dispatch(
			this.component.store( 'selection' ).actions.deselectAll(),
		);
	}

	static reducer() {
		return [];
	}
}

export default DeselectAll;
