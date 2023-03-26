import { systemEventMeta } from '@elementor/events';

export class Exit extends $e.modules.CommandBase {
	apply() {
		$e.route( 'panel/menu', {}, systemEventMeta( {
			source: 'panel',
			trigger: 'exit',
		} ) );
	}
}

export default Exit;
