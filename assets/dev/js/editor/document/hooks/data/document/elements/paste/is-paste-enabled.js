import Dependency from 'elementor-api/modules/hooks/data/dependency';
import DocumentHelper from 'elementor-document/helper';

export class IsPasteEnabled extends Dependency {
	getCommand() {
		return 'document/elements/paste';
	}

	getId() {
		return 'is-paste-enabled';
	}

	getConditions( args ) {
		return ! args.rebuild;
	}

	apply( args ) {
		const { containers = [ args.container ] } = args;

		return containers.some( ( container ) =>
			DocumentHelper.isPasteEnabled( container )
		);
	}
}

export default IsPasteEnabled;
