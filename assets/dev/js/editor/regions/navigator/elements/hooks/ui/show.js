import After from 'elementor-api/modules/hooks/ui/after';
import Helper from './helper';

export class Show extends After {
	getCommand() {
		return 'navigator/elements/show';
	}

	getId() {
		return 'navigator-elements-show';
	}

	apply( args ) {
		const { element } = args;

		Helper.toggleVisibilityClass( element.model.get( 'id' ) );
	}
}

export default Show;
