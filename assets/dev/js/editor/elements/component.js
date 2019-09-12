// TODO: Maybe it should merge with panel/elements?
export default class extends elementorModules.common.Component {
	getNamespace() {
		return 'elements';
	}

	dependency() {
		return ! ! elementor.getCurrentElement();
	}

	defaultCommands() {
		return {
			copy: () => elementor.getCurrentElement().copy(),
			duplicate: () => elementor.getCurrentElement().duplicate(),
			delete: () => elementor.getCurrentElement().removeElement(),
			paste: () => elementor.getCurrentElement().paste(),
			pasteStyle: () => elementor.getCurrentElement().pasteStyle(),
		};
	}

	defaultShortcuts() {
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
