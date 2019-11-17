import History from '../../commands/base/history';

export class CopyAll extends History {
	getHistory( args ) { // eslint-disable-line no-unused-vars
		// No history for the command.
		return false;
	}

	apply() {
		$e.run( 'document/elements/copy', {
			containers: Object.values( elementor.getPreviewView().children._views ).map( ( view ) => view.getContainer() ),
		} );
	}
}

export default CopyAll;
