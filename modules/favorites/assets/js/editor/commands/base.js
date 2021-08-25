import CommandBase from 'elementor-api/modules/command-base';

export default class CommandsBase extends CommandBase {
	/**
	 * @inheritDoc
	 */
	validateArgs( args = {} ) {
		this.requireArgumentType( 'type', 'string', args );
		this.requireArgumentType( 'favorite', 'string', args );
	}
}
