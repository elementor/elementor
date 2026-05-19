import { type CreateElementParams, type V1Element, type V1ElementConfig } from '@elementor/editor-elements';

import { CompositionBuilder } from '../composition-builder';

const GENERATED_ELEMENT_ID = 'generated-element-id';

const FORM_WIDGETS_CACHE_WITH_REQUIRED_CHILDREN = {
	'e-form': {
		title: 'Form',
		controls: {},
		elType: 'widget',
		default_children: [
			{
				elType: 'e-form-success-message',
				meta: { required: true },
				elements: [],
			},
			{
				elType: 'e-form-error-message',
				meta: { required: true },
				elements: [],
			},
			{
				elType: 'widget',
				widgetType: 'e-form-input',
				elements: [],
			},
		],
	},
	'e-form-error-message': {
		title: 'Error',
		controls: {},
		elType: 'e-form-error-message',
	},
	'e-form-input': { title: 'Input', controls: {}, elType: 'widget' },
	'e-form-success-message': {
		title: 'Success',
		controls: {},
		elType: 'e-form-success-message',
	},
} as const satisfies Record< string, V1ElementConfig >;

const createMockRootContainer = (): V1Element =>
	( {
		id: 'root',
		model: { get: jest.fn(), set: jest.fn(), toJSON: jest.fn() },
		settings: { get: jest.fn(), set: jest.fn(), toJSON: jest.fn() },
		children: [],
	} ) as unknown as V1Element;

const createMockPartialContainer = ( id: string ): V1Element =>
	( {
		id,
		model: { get: jest.fn(), set: jest.fn(), toJSON: jest.fn() },
		settings: { get: jest.fn(), set: jest.fn(), toJSON: jest.fn() },
		children: [],
	} ) as unknown as V1Element;

describe( 'CompositionBuilder.build required children', () => {
	it( 'rejects build when required direct children are absent from XML', async () => {
		// Arrange
		let elementIdSequence = 0;
		const createdElement = createMockPartialContainer( GENERATED_ELEMENT_ID );
		const createElementMock = jest.fn().mockReturnValue( createdElement );
		const builder = CompositionBuilder.fromXMLString(
			'<e-form configuration-id="form-1"><e-form-input /></e-form>',
			{
				createElement: createElementMock,
				deleteElement: jest.fn(),
				getContainer: jest.fn(),
				generateElementId: jest.fn().mockImplementation( () => `form-comp-${ ++elementIdSequence }` ),
				getWidgetsCache: jest.fn().mockReturnValue( FORM_WIDGETS_CACHE_WITH_REQUIRED_CHILDREN ),
				doUpdateElementProperty: jest.fn(),
			}
		);

		// Act & Assert
		await expect( builder.build( createMockRootContainer() ) ).rejects.toThrow(
			/Missing required direct child element tag\(s\): e-form-success-message, e-form-error-message/
		);
		expect( createElementMock ).not.toHaveBeenCalled();
	} );

	it( 'rejects build when only some required direct children exist', async () => {
		let elementIdSequence = 0;
		const createdElement = createMockPartialContainer( GENERATED_ELEMENT_ID );
		const createElementMock = jest.fn().mockReturnValue( createdElement );
		const builder = CompositionBuilder.fromXMLString(
			'<e-form configuration-id="form-1"><e-form-success-message /><e-form-input /></e-form>',
			{
				createElement: createElementMock,
				deleteElement: jest.fn(),
				getContainer: jest.fn(),
				generateElementId: jest.fn().mockImplementation( () => `form-comp-${ ++elementIdSequence }` ),
				getWidgetsCache: jest.fn().mockReturnValue( FORM_WIDGETS_CACHE_WITH_REQUIRED_CHILDREN ),
				doUpdateElementProperty: jest.fn(),
			}
		);

		// Act & Assert
		await expect( builder.build( createMockRootContainer() ) ).rejects.toThrow(
			/Missing required direct child element tag\(s\): e-form-error-message/
		);
		expect( createElementMock ).not.toHaveBeenCalled();
	} );

	it( 'creates elements when XML includes all required direct children', async () => {
		// Arrange
		let elementIdSequence = 0;
		const createdElement = createMockPartialContainer( GENERATED_ELEMENT_ID );
		const createElementMock = jest.fn().mockReturnValue( createdElement );
		const builder = CompositionBuilder.fromXMLString(
			'<e-form configuration-id="form-1">' +
				'<e-form-success-message /><e-form-error-message /><e-form-input />' +
				'</e-form>',
			{
				createElement: createElementMock,
				deleteElement: jest.fn(),
				getContainer: jest.fn(),
				generateElementId: jest.fn().mockImplementation( () => `form-comp-${ ++elementIdSequence }` ),
				getWidgetsCache: jest.fn().mockReturnValue( FORM_WIDGETS_CACHE_WITH_REQUIRED_CHILDREN ),
				doUpdateElementProperty: jest.fn(),
			}
		);

		// Act
		await builder.build( createMockRootContainer() );

		// Assert
		const createArgs = createElementMock.mock.calls[ 0 ]?.[ 0 ] as CreateElementParams;
		const childElements = ( createArgs.model?.elements || [] ) as Array< { elType?: string; widgetType?: string } >;

		expect( childElements.filter( ( child ) => child.elType === 'e-form-success-message' ).length ).toBe( 1 );
		expect( childElements.filter( ( child ) => child.elType === 'e-form-error-message' ).length ).toBe( 1 );
		expect( childElements.some( ( child ) => child.widgetType === 'e-form-input' ) ).toBe( true );
	} );
} );
