import Dependency from 'elementor-api/modules/hooks/data/dependency';

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
			$e.components.get( 'document/elements' ).utils.isPasteEnabled( container ),
		);
	}
}

export default IsPasteEnabled;
