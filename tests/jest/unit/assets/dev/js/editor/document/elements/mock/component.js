import { setupMock } from 'elementor/tests/jest/unit/modules/web-cli/assets/js/core/mock/api';

export async function mockElementsComponent() {
	await setupMock();

	jest.mock( 'elementor-editor/components/documents/document', () => (
		class Document {
			constructor( config ) {
				this.id = config.id;

				this.container = {
					view: 'old-view',
					model: {
						attributes: {
							elements: 'old-elements',
						},
					},
				};
			}
		}
	) );

	global.elementor = {
		helpers: {
			getModelLabel: () => '',
		},
		documents: {
			getCurrent: () => ( {
				history: {
					getActive: () => false,
				},
			} ),
			getCurrentId: () => 1,
		},
		elements: {
			reset: () => {},
			toJSON: () => {},
		},
		getPreviewContainer: () => ( {
			panel: {
				closeEditor: () => {},
			},
		} ),
	};

	global.elementorModules = {
		editor: {
			Container: Object,
		},
	};

	global.elementorCommon = {
		helpers: {
			consoleError: () => {},
		},
	};

	global.__ = ( text ) => text;

	global.$e.modules.editor = {
		CommandContainerBase: ( await import( 'elementor-editor/command-bases/command-container-base' ) ).default,
		CommandContainerInternalBase: ( await import( 'elementor-editor/command-bases/command-container-internal-base' ) ).default,
		document: {
			CommandHistoryBase: ( await import( 'elementor-document/command-bases/command-history-base' ) ).default,
			CommandHistoryDebounceBase: ( await import( 'elementor-document/command-bases/command-history-debounce-base' ) ).default,
		},
	};

	const ElementsComponent = ( await import( 'elementor-document/elements/component' ) ).default;

	$e.components.register( new class extends $e.modules.ComponentBase {
		getNamespace() {
			return 'document/save';
		}

		defaultCommandsInternal() {
			return {
				'set-is-modified': () => {},
			};
		}
	} );

	$e.components.register( new ElementsComponent() );
}

export function createContainer( args = {} ) {
	const container = {
		view: {
			addElement: ( model ) => ( {
				getContainer: () => ( {
					model: {
						...model,
						toJSON: () => model,
					},
				} ),
			} ),
		},
		settings: {
			set: () => {},
		},
		lookup: () => container,
		model: {
			destroy: () => {},
			refresh: () => {},
		},
		...args,
	};

	return container;
}
