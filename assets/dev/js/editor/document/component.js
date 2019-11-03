import * as Commands from './commands/';
import * as Hooks from './hooks/';

export default class Component extends elementorModules.common.Component {
	onInit() {
		super.onInit();

		this.hooks = {};

		// Load hooks.
		Object.entries( Hooks ).forEach( ( [ hook, hookReference ] ) =>
			this.hooks[ hook ] = new hookReference()
		);
	}

	getNamespace() {
		return 'document';
	}

	defaultCommands() {
		return {
			'auto-save': ( args ) => ( new Commands.AutoSave( args ).run() ),
			'default-save': ( args ) => ( new Commands.DefaultSave( args ).run() ),
			discard: ( args ) => ( new Commands.Discard( args ).run() ),
			draft: ( args ) => ( new Commands.Draft( args ).run() ),
			pending: ( args ) => ( new Commands.Pending( args ).run() ),
			publish: ( args ) => ( new Commands.Publish( args ).run() ),
			saver: ( args ) => ( new Commands.Saver( args ).run() ),
			update: ( args ) => ( new Commands.Update( args ).run() ),
		};
	}
}
