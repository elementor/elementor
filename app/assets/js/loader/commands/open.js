import { systemEventMeta } from '@elementor/events';

export class Open extends $e.modules.CommandBase {
	apply( args ) {
		$e.route( 'app', args, systemEventMeta( {
			source: 'app',
		} ) );

		return true;
	}
}

export default Open;
