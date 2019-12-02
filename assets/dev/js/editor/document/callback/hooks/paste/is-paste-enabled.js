import HookDependency from '../base/dependency';
import DocumentUtils from 'elementor-document/utils/helpers';

export class IsPasteEnabled extends HookDependency {
	getCommand() {
		return 'document/elements/paste';
	}

	getId() {
		return 'is-paste-enabled';
	}

	apply( args ) {
		if ( args.rebuild ) { // TODO: move to conditions.
			return true;
		}

		const { containers = [ args.container ] } = args;

		// TODO: use containers.some. ( multi selection ).
		return DocumentUtils.isPasteEnabled( containers[ 0 ] );
	}
}

export default IsPasteEnabled;
