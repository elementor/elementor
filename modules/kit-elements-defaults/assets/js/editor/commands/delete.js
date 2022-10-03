import store from '../store';

export default class Delete extends $e.modules.CommandBase {
	async apply( { type } ) {
		$e.internal( 'panel/state-loading' );

		try {
			await store.delete( type );
		} catch ( e ) {
			// TODO: Show error toast.
			// eslint-disable-next-line no-console
			console.error( e );
		} finally {
			$e.internal( 'panel/state-ready' );
		}
	}
}
