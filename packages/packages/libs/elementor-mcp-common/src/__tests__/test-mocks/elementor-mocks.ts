import type { ElementorContainer } from '../../types';
import { elementorCommon } from './elementor-common';

interface MockElementorControl {
	type?: string;
	default?: unknown;
	options?: Record< string, string > | undefined;
	return_value?: string | undefined;
	fields?: Record< string, Partial< MockElementorControl > > | undefined;
	size_units?: string[] | undefined;
	range?: { min?: number; max?: number; step?: number } | undefined;
	[ key: string ]: unknown;
}

interface MockElementorWidget {
	controls: Record< string, MockElementorControl >;
}

interface MockElementorDocuments {
	getCurrent: jest.Mock< MockElementorDocument | null >;
}

interface MockElementor {
	documents: MockElementorDocuments;
	getContainer: jest.Mock< ElementorContainer | null, [ string ] >;
	widgetsCache: Record< string, MockElementorWidget >;
	config: {
		controls: Record< string, MockElementorControl >;
	};
}

interface MockElementorDocument {
	id: string;
	history: {
		active: boolean;
		setActive: jest.Mock;
	};
	config: {
		type: string;
		settings: {
			settings: {
				post_title: string;
			};
		};
	};
	container: ElementorContainer;
}

export function createMockContainer( overrides: Partial< Record< string, unknown > > = {} ): ElementorContainer {
	const defaultContainer = {
		id: 'test-container-id',
		type: 'widget',
		model: {
			get: jest.fn(),
			widgetType: 'heading',
			attributes: {
				id: 'test-container-id',
				elType: 'widget',
				widgetType: 'heading',
				title: 'Test Heading',
			},
		},
		view: {
			el: document.createElement( 'div' ),
		},
		settings: {
			attributes: {
				text: 'Test heading text',
				size: 'large',
			},
			controls: {},
			get: jest.fn(),
			toJSON: jest.fn( () => ( {} ) ),
		},
		children: [],
		parent: null,
		globals: {
			get: jest.fn(),
			set: jest.fn(),
		},
	};

	return { ...defaultContainer, ...overrides } as unknown as ElementorContainer;
}

export function createMockDocument( overrides: Partial< MockElementorDocument > = {} ): MockElementorDocument {
	const defaultDocument: MockElementorDocument = {
		id: 'test-document-id',
		history: {
			active: false,
			setActive: jest.fn(),
		},
		config: {
			type: 'wp-page',
			settings: {
				settings: {
					post_title: 'Test Page',
				},
			},
		},
		container: createMockContainer(),
	};

	return { ...defaultDocument, ...overrides };
}

export function createMockElementor( overrides: Partial< MockElementor > = {} ): MockElementor {
	const defaultElementor: MockElementor = {
		documents: {
			getCurrent: jest.fn( () => createMockDocument() ),
		},
		getContainer: jest.fn( ( id: string ) => ( id === 'test-container-id' ? createMockContainer() : null ) ),
		config: {
			controls: {
				text: { type: 'text' },
				select: { type: 'select' },
				color: { type: 'color' },
				repeater: { type: 'repeater' },
				dimensions: { type: 'dimensions' },
			},
		},
		widgetsCache: {
			heading: {
				controls: {
					text: {
						type: 'text',
						default: 'Default heading',
					},
					size: {
						type: 'select',
						default: 'medium',
						options: {
							small: 'Small',
							medium: 'Medium',
							large: 'Large',
						},
					},
					color: {
						type: 'color',
						default: '#000000',
						return_value: 'yes',
					},
					repeater_field: {
						type: 'repeater',
						default: [],
						fields: {
							item_text: {
								default: 'Item text',
							},
							item_link: {
								default: '',
							},
						},
					},
				},
			},
		},
	};

	return { ...defaultElementor, ...overrides };
}

export interface ElementorMockSetup {
	mockElementor: MockElementor;
	mockElementorCommon: typeof elementorCommon;
	mockDocument: MockElementorDocument;
	mockContainer: ElementorContainer;
}

export function setupElementorMocks(
	overrides: {
		elementor?: Partial< MockElementor >;
		elementorCommon?: Partial< typeof elementorCommon >;
		document?: Partial< MockElementorDocument >;
		container?: Partial< Record< string, unknown > >;
	} = {}
): ElementorMockSetup {
	const mockContainer = createMockContainer( overrides.container );
	const mockDocument = createMockDocument( overrides.document );
	const mockElementor = createMockElementor( {
		...overrides.elementor,
		documents: {
			getCurrent: jest.fn( () => mockDocument ),
			...overrides.elementor?.documents,
		},
		getContainer: jest.fn( ( id: string ) =>
			id === ( mockContainer as unknown as { id: string } ).id ? mockContainer : null
		),
		...overrides.elementor,
	} );
	const mockElementorCommon = { ...elementorCommon, ...overrides.elementorCommon };

	Object.defineProperty( window, 'elementor', {
		value: mockElementor,
		writable: true,
		configurable: true,
	} );

	Object.defineProperty( window, 'elementorCommon', {
		value: mockElementorCommon,
		writable: true,
		configurable: true,
	} );

	return {
		mockElementor,
		mockElementorCommon,
		mockDocument,
		mockContainer,
	};
}

export function cleanupElementorMocks() {
	Object.defineProperty( window, 'elementor', {
		value: undefined,
		writable: true,
		configurable: true,
	} );

	Object.defineProperty( window, 'elementorCommon', {
		value: undefined,
		writable: true,
		configurable: true,
	} );
}

export function createContainerMock( children: ElementorContainer[] = [] ): ElementorContainer {
	return createMockContainer( {
		model: {
			get: jest.fn(),
			widgetType: '',
			attributes: {
				id: 'container-id',
				elType: 'container',
			},
		},
		children,
	} );
}
