import Base from './base/base';

export class Discard extends Base {
	apply( args ) {
		const { document = elementor.documents.getCurrent() } = args;

		// Start server request before undo, because the undo can take time.
		const deferred = elementorCommon.ajax.addRequest( 'discard_changes' );

		$e.run( 'document/history/undo-all', { document } );

		// Discard autosave revision if exist.
		return deferred;
	}
}

export default Discard;
