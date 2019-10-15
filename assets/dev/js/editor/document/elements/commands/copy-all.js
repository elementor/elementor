import Base from '../../commands/base.js';

export class CopyAll extends Base {
	getHistory( args ) {
		// No history for the command.
		return false;
	}

	apply() {
		$e.run( 'document/elements/copy', {
			containers: Object.values( elementor.getPreviewView().children._views ).map( ( view ) => view.getContainer() ),
			elementsType: 'section',
		} );
	}
}

export default CopyAll;
