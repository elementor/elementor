import * as Commands from './commands/';

export default class Component extends elementorModules.common.Component {
	getNamespace() {
		return 'document/save';
	}

	defaultCommands() {
		return {
			auto: ( args ) => ( new Commands.Auto( args ).run() ),
			default: ( args ) => ( new Commands.Default( args ).run() ),
			discard: ( args ) => ( new Commands.Discard( args ).run() ),
			draft: ( args ) => ( new Commands.Draft( args ).run() ),
			pending: ( args ) => ( new Commands.Pending( args ).run() ),
			publish: ( args ) => ( new Commands.Publish( args ).run() ),
			saver: ( args ) => ( new Commands.Saver( args ).run() ),
			update: ( args ) => ( new Commands.Update( args ).run() ),
		};
	}
}
