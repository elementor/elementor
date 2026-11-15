import { handleV3LayoutInsertTool, insertV3Layout } from '../handler';

describe( 'v3-layout-insert handler', () => {
	const run = jest.fn();
	const internal = jest.fn();

	beforeEach( () => {
		jest.clearAllMocks();
		internal.mockReturnValueOnce( 'history-1' );
		( window as unknown as { $e?: { run: typeof run; internal: typeof internal } } ).$e = { run, internal };
		(
			window as unknown as {
				elementor?: {
					getPreviewContainer: () => { id: string; children: { at: () => unknown } };
					getContainer: ( id: string ) => { id: string } | null;
					helpers: { isAtomicWidget: () => boolean };
					widgetsCache: Record< string, object >;
					getConfig: () => { elements: Record< string, unknown > };
				};
			}
		).elementor = {
			getPreviewContainer: () => ( { id: 'root', children: { at: () => ( {} ) } } ),
			getContainer: ( id: string ) => ( 'missing' === id ? null : { id } ),
			helpers: { isAtomicWidget: () => false },
			widgetsCache: { heading: {} },
			getConfig: () => ( { elements: {} } ),
		};
		run.mockResolvedValue( { id: 'new-el' } );
	} );

	it( 'inserts a widget through document/elements/create inside one history log', async () => {
		// Arrange
		const elements = {
			elType: 'widget',
			widgetType: 'heading',
			settings: { title: 'Hi' },
		};

		// Act
		const result = await insertV3Layout( { elements, at: 0 } );

		// Assert
		expect( result.success ).toBe( true );
		expect( run ).toHaveBeenCalledWith( 'document/elements/create', expect.objectContaining( { options: { at: 0, edit: false } } ) );
		expect( internal ).toHaveBeenCalledWith( 'document/history/start-log', expect.any( Object ) );
		expect( internal ).toHaveBeenCalledWith( 'document/history/end-log', { id: 'history-1' } );
	} );

	it( 'rejects atomic widget models', async () => {
		// Arrange
		( window as unknown as { elementor?: { helpers: { isAtomicWidget: () => boolean } } } ).elementor!.helpers =
			{ isAtomicWidget: () => true };

		// Act / Assert
		await expect(
			handleV3LayoutInsertTool( { elements: { elType: 'widget', widgetType: 'heading' } } )
		).rejects.toThrow( /atomic/i );
	} );

	it( 'rejects compound e-* element types', async () => {
		// Arrange
		(
			window as unknown as {
				elementor?: { getConfig: () => { elements: Record< string, { meta: { is_compound: boolean } } > } };
			}
		).elementor!.getConfig = () => ( { elements: { 'e-tabs': { meta: { is_compound: true } } } } );

		// Act / Assert
		await expect( handleV3LayoutInsertTool( { elements: { elType: 'e-tabs' } } ) ).rejects.toThrow(
			/not supported/i
		);
	} );
} );