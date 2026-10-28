import { getContainer, getSelectedElements, getWidgetsCache } from '@elementor/editor-elements';

import { initSelectedElementResource } from '../selected-element-resource';

jest.mock( '@elementor/editor-elements', () => ( {
	getContainer: jest.fn(),
	getSelectedElements: jest.fn(),
	getWidgetsCache: jest.fn(),
} ) );

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	__privateListenTo: jest.fn(),
	commandEndEvent: jest.fn(),
} ) );

type ResourceHandler = () => Promise< { contents: { text: string }[] } >;

const stringProp = ( meta: Record< string, unknown > = {} ) => ( {
	kind: 'plain',
	key: 'string',
	settings: {},
	meta,
} );

const givenSelectedContainer = ( modelProps: Record< string, unknown >, settings: Record< string, unknown > ) => {
	jest.mocked( getSelectedElements ).mockReturnValue( [ { id: 'el-1' } ] as never );
	jest.mocked( getContainer ).mockReturnValue( {
		id: 'el-1',
		type: modelProps.widgetType ? 'widget' : ( modelProps.elType as string ),
		model: {
			get: ( key: string ) => modelProps[ key ],
			config: { atomic: true },
		},
		settings: {
			toJSON: () => settings,
		},
	} as never );
};

const readProperties = async () => {
	const resource = jest.fn();
	initSelectedElementResource( { resource, sendResourceUpdated: jest.fn() } as never );

	const handler = resource.mock.calls[ 0 ][ 3 ] as ResourceHandler;
	const result = await handler();

	return JSON.parse( result.contents[ 0 ].text ).properties;
};

describe( 'selected-element-resource', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'omits sensitive props of an atomic widget', async () => {
		// Arrange.
		jest.mocked( getWidgetsCache ).mockReturnValue( {
			'e-heading': {
				atomic_props_schema: {
					tag: stringProp(),
					api_key: stringProp( { sensitive: true } ),
				},
			},
		} as never );

		givenSelectedContainer(
			{ elType: 'widget', widgetType: 'e-heading' },
			{
				tag: { $$type: 'string', value: 'h2' },
				api_key: { $$type: 'string', value: 'secret' },
			}
		);

		// Act.
		const properties = await readProperties();

		// Assert.
		expect( properties ).toEqual( { tag: { $$type: 'string', value: 'h2' } } );
	} );

	it( 'omits sensitive props of an atomic element that has no widgetType', async () => {
		// Arrange.
		jest.mocked( getWidgetsCache ).mockReturnValue( {
			'e-form': {
				atomic_props_schema: {
					'form-name': stringProp(),
					'mailchimp-api-key': stringProp( { sensitive: true } ),
				},
			},
		} as never );

		givenSelectedContainer(
			{ elType: 'e-form' },
			{
				'form-name': { $$type: 'string', value: 'Contact' },
				'mailchimp-api-key': { $$type: 'string', value: 'secret' },
			}
		);

		// Act.
		const properties = await readProperties();

		// Assert.
		expect( properties ).toEqual( { 'form-name': { $$type: 'string', value: 'Contact' } } );
	} );
} );
