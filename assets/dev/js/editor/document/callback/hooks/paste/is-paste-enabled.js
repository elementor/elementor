import HookDependency from '../base/dependency';
import DocumentUtils from 'elementor-document/utils/helpers';

export class IsPasteEnabled extends HookDependency {
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
			DocumentUtils.isPasteEnabled( container )
		);
	}
}

export default IsPasteEnabled;
