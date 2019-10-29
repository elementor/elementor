import HookAfter from '../base/after';
import Debounce from '../../commands/debounce';

export class HandleDynamic extends HookAfter {
	hook() {
		return 'document/elements/settings';
	}

	id() {
		return 'handle-dynamic';
	}

	conditioning( args ) {
		const { containers = [ args.container ] } = args;

		return containers.some( ( /**Container*/ container ) => 'dynamic' === container.type );
	}

	apply( args ) {
		const { containers = [ args.container ] } = args;

		containers.forEach( ( /**Container*/ container ) => {
			if ( 'dynamic' === container.type ) {
				const tagText = elementor.dynamicTags.tagContainerToTagText( container ),
					commandArgs = {
						container: container.parent,
						settings: {
							[ container.view.options.controlName ]: tagText,
						},
					};

				// Upon debounce, chain HistoryId.
				if ( Debounce.lastHistoryId ) {
					commandArgs.histroyId = Debounce.lastHistoryId;

				}

				$e.run( 'document/dynamic/settings', commandArgs );
			}
		} );

		return true;
	}
}

export default HandleDynamic;
