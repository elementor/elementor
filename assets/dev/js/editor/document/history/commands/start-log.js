import Base from '../../commands/base/base';

export class StartLog extends Base {
	initialize( args ) {
		if ( elementor.history.history.isItemStarted() || args.id ) {
			this.isSubItem = true;

			return;
		}

		this.args = this.component.normalizeLogTitle( args );
	}

	validateArgs( args ) {
		if ( ! this.isSubItem ) {
			this.requireArgumentType( 'type', 'string', args );
			this.requireArgumentType( 'title', 'string', args );
		}
	}

	apply( args ) {
		if ( this.isSubItem ) {
			$e.run( 'document/history/log-sub-item', args );

			return null;
		}

		return elementor.history.history.startItem( args );
	}
}

export default StartLog;
