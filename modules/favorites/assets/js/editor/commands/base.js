export default class CommandsBase extends $e.modules.CommandBase {
	validateArgs( args = {} ) {
		this.requireArgumentType( 'type', 'string', args );
		this.requireArgumentType( 'favorite', 'string', args );
	}
}
