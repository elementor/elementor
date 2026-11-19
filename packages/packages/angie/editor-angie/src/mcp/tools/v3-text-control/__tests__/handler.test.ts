import { getTextControlValue, handleTextControlTool, setTextControlValue } from '../handler';

const ELEMENT_ID = 'el-text-1';
const CONTROL_NAME = 'title';

const createContainer = ( {
	controlType = 'text',
	aiActive = true,
	value = 'Current title',
}: {
	controlType?: string;
	aiActive?: boolean;
	value?: string;
} = {} ) => {
	const settings = {
		controls: {
			[ CONTROL_NAME ]: {
				type: controlType,
				ai: { active: aiActive, type: controlType },
			},
		},
		get: jest.fn( () => value ),
	};

	return {
		model: { id: ELEMENT_ID },
		settings,
	};
};

describe( 'v3-text-control handler', () => {
	let run: jest.Mock;
	let getContainer: jest.Mock;
	let isAtomicWidget: jest.Mock;

	beforeEach( () => {
		run = jest.fn( () => Promise.resolve() );
		getContainer = jest.fn();
		isAtomicWidget = jest.fn( () => false );

		Object.defineProperty( window, '$e', {
			configurable: true,
			writable: true,
			value: { run },
		} );
		Object.defineProperty( window, 'elementor', {
			configurable: true,
			writable: true,
			value: {
				getContainer,
				helpers: {
					isAtomicWidget,
				},
			},
		} );
	} );

	afterEach( () => {
		Reflect.deleteProperty( window, '$e' );
		Reflect.deleteProperty( window, 'elementor' );
		jest.clearAllMocks();
	} );

	it( 'reads the current value of a valid V3 text control', () => {
		// Arrange
		const container = createContainer( { value: 'Hello world' } );
		getContainer.mockReturnValue( container );

		// Act
		const result = getTextControlValue( {
			elementId: ELEMENT_ID,
			controlName: CONTROL_NAME,
		} );

		// Assert
		expect( result ).toEqual( {
			elementId: ELEMENT_ID,
			controlName: CONTROL_NAME,
			controlType: 'text',
			value: 'Hello world',
		} );
	} );

	it( 'writes through document/elements/settings with external: true for one undo step', async () => {
		// Arrange
		const container = createContainer();
		getContainer.mockReturnValue( container );

		// Act
		const result = await setTextControlValue( {
			elementId: ELEMENT_ID,
			controlName: CONTROL_NAME,
			value: 'New title',
		} );

		// Assert
		expect( run ).toHaveBeenCalledWith( 'document/elements/settings', {
			container,
			settings: { [ CONTROL_NAME ]: 'New title' },
			options: { external: true },
		} );
		expect( result ).toEqual( {
			success: true,
			elementId: ELEMENT_ID,
			controlName: CONTROL_NAME,
			controlType: 'text',
			value: 'New title',
		} );
	} );

	it( 'converts newlines to br for wysiwyg controls', async () => {
		// Arrange
		const container = createContainer( { controlType: 'wysiwyg' } );
		getContainer.mockReturnValue( container );

		// Act
		await setTextControlValue( {
			elementId: ELEMENT_ID,
			controlName: CONTROL_NAME,
			value: 'Line 1\nLine 2',
		} );

		// Assert
		expect( run ).toHaveBeenCalledWith(
			'document/elements/settings',
			expect.objectContaining( {
				settings: { [ CONTROL_NAME ]: 'Line 1<br>Line 2' },
			} )
		);
	} );

	it( 'rejects missing elements', async () => {
		// Arrange
		getContainer.mockReturnValue( null );

		// Act / Assert
		await expect(
			handleTextControlTool( {
				action: 'set',
				elementId: ELEMENT_ID,
				controlName: CONTROL_NAME,
				value: 'x',
			} )
		).rejects.toThrow( `Element with ID ${ ELEMENT_ID } not found.` );
		expect( run ).not.toHaveBeenCalled();
	} );

	it( 'rejects atomic elements', async () => {
		// Arrange
		const container = createContainer();
		getContainer.mockReturnValue( container );
		isAtomicWidget.mockReturnValue( true );

		// Act / Assert
		await expect(
			handleTextControlTool( {
				action: 'set',
				elementId: ELEMENT_ID,
				controlName: CONTROL_NAME,
				value: 'x',
			} )
		).rejects.toThrow( /atomic element/ );
		expect( run ).not.toHaveBeenCalled();
	} );

	it( 'rejects non-text controls', async () => {
		// Arrange
		const container = createContainer( { controlType: 'media' } );
		getContainer.mockReturnValue( container );

		// Act / Assert
		await expect(
			handleTextControlTool( {
				action: 'get',
				elementId: ELEMENT_ID,
				controlName: CONTROL_NAME,
			} )
		).rejects.toThrow( /not a V3 text control/ );
	} );

	it( 'rejects controls without AI text support', async () => {
		// Arrange
		const container = createContainer( { aiActive: false } );
		getContainer.mockReturnValue( container );

		// Act / Assert
		await expect(
			handleTextControlTool( {
				action: 'get',
				elementId: ELEMENT_ID,
				controlName: CONTROL_NAME,
			} )
		).rejects.toThrow( /does not have AI text support/ );
	} );
} );
