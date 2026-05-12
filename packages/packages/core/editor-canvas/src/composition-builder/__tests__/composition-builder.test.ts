import { type CreateElementParams, type V1Element, type V1ElementConfig } from '@elementor/editor-elements';

import { CompositionBuilder } from '../composition-builder';

describe( 'CompositionBuilder', () => {
	const createWidgetsCache = (): Record< string, V1ElementConfig > => ( {
		'e-form': {
			title: 'Form',
			controls: {},
			elType: 'widget',
			default_children: [
				{ elType: 'e-form-success-message', meta: { required: true }, elements: [] },
				{ elType: 'e-form-error-message', meta: { required: true }, elements: [] },
			],
		} as V1ElementConfig,
		'e-form-input': { title: 'Input', controls: {}, elType: 'widget' } as V1ElementConfig,
		'e-form-success-message': {
			title: 'Success',
			controls: {},
			elType: 'e-form-success-message',
		} as V1ElementConfig,
		'e-form-error-message': {
			title: 'Error',
			controls: {},
			elType: 'e-form-error-message',
		} as V1ElementConfig,
	} );

	const createElementMock = jest.fn( ( { model }: CreateElementParams ) => {
		const view = {
			_currentRenderPromise: Promise.resolve(),
		} as unknown as V1Element[ 'view' ];

		return {
			id: String( model?.id || 'created-id' ),
			view,
		} as V1Element;
	} );

	const createBuilder = ( xmlStructure: string ) =>
		CompositionBuilder.fromXMLString( xmlStructure, {
			createElement: createElementMock,
			getWidgetsCache: < T extends V1ElementConfig >() => createWidgetsCache() as Record< string, T >,
			generateElementId: jest.fn( () => Math.random().toString( 36 ).slice( 2 ) ),
		} );

	beforeEach( () => {
		createElementMock.mockClear();
	} );

	it( 'should inject required children before build when missing from XML', async () => {
		// Arrange
		const builder = createBuilder( '<e-form configuration-id="form-1"><e-form-input /></e-form>' );

		// Act
		await builder.build( {} as V1Element );

		// Assert
		const createArgs = createElementMock.mock.calls[ 0 ]?.[ 0 ] as CreateElementParams;
		const childElements = ( createArgs.model?.elements || [] ) as Array< { elType?: string; widgetType?: string } >;

		expect( childElements.some( ( child ) => child.elType === 'e-form-success-message' ) ).toBe( true );
		expect( childElements.some( ( child ) => child.elType === 'e-form-error-message' ) ).toBe( true );
	} );

	it( 'should not duplicate required child types that are already in XML', async () => {
		// Arrange
		const builder = createBuilder(
			'<e-form configuration-id="form-1"><e-form-success-message /><e-form-input /></e-form>'
		);

		// Act
		await builder.build( {} as V1Element );

		// Assert
		const createArgs = createElementMock.mock.calls[ 0 ]?.[ 0 ] as CreateElementParams;
		const childElements = ( createArgs.model?.elements || [] ) as Array< { elType?: string; widgetType?: string } >;
		const successCount = childElements.filter( ( child ) => child.elType === 'e-form-success-message' ).length;

		expect( successCount ).toBe( 1 );
		expect( childElements.some( ( child ) => child.elType === 'e-form-error-message' ) ).toBe( true );
	} );
} );
