import Dependency from 'elementor-api/modules/hooks/data/dependency';
import Helper from 'elementor-document/hooks/data/document/elements/helper';

export class SetFlexOrder extends Dependency {
	getCommand() {
		return 'document/elements/move';
	}

	getId() {
		return 'set-flex-order';
	}

	getConditions( args ) {
		const { target } = args;

		// Fire the hook only when the target is a swappable element.
		return ! ! target.view.getSortableOptions()?.swappable;
	}

	apply( args ) {
		const { containers = [ args.container ] } = args;

		containers.forEach( ( container ) => {
			Helper.setFlexOrder( container, args.options?.at );
		} );

		return false;
	}
}

export default SetFlexOrder;
