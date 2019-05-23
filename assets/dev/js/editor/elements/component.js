// TODO: Maybe it should merge with panel/elements?
export default class extends elementorModules.Component {
	getNamespace() {
		return 'elements';
	}

	dependency( args ) {
		return ! ! args.element;
	}

	getCommands() {
		return {
			copy: ( args ) => args.element.copy(),
			duplicate: ( args ) => args.element.duplicate(),
			delete: ( args ) => args.element.removeElement(),
			paste: ( args ) => args.element.paste(),
			pasteStyle: ( args ) => args.element.paste(),
		};
	}

	getShortcuts() {
		return {
			copy: {
				keys: 'ctrl+c',
				exclude: [ 'input' ],
			},
			duplicate: {
				keys: 'ctrl+d',
			},
			delete: {
				keys: 'del',
				exclude: [ 'input' ],
			},
			paste: {
				keys: 'ctrl+v',
				exclude: [ 'input' ],
				dependency: () => {
					return elementor.getCurrentElement().isPasteEnabled();
				},
			},
			pasteStyle: {
				keys: 'ctrl+shift+v',
				exclude: [ 'input' ],
				dependency: () => {
					return elementor.getCurrentElement().pasteStyle && elementorCommon.storage.get( 'transfer' );
				},
			},
		};
	}
}
