export default class HookBreak extends Error {
	constructor( args ) {
		super( 'HookBreak' );
		this.args = args;
	}
}
