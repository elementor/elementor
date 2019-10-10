import Save from './commnds/save';

export default class extends elementorModules.common.Component {
	getNamespace() {
		return 'document';
	}

	defaultCommands() {
		return {
			save: ( args ) => new Save( args ).run(),
		};
	}

	defaultShortcuts() {
		return {
			save: {
				keys: 'ctrl+s',
				exclude: [ 'input' ],
			},
		};
	}
}
