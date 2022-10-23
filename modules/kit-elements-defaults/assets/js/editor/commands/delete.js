import { deleteElementDefaults } from '../api';

export default class Delete extends $e.modules.CommandBase {
	async apply( { type } ) {
		$e.internal( 'panel/state-loading' );

		try {
			await deleteElementDefaults( type );
		} catch ( e ) {
			// TODO: Show error toast.
		} finally {
			$e.internal( 'panel/state-ready' );
		}
	}
}
