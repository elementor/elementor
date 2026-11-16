import { getCodeControlValue, handleCodeControlTool, setCodeControlValue } from '../handler';

const ELEMENT_ID = 'el-code-1';
const CONTROL_NAME = 'custom_css';

const createContainer = ( {
	controlType = 'code',
	aiActive = true,
	language = 'css',
	value = '.foo { color: red; }',
}: {
	controlType?: string;
	aiActive?: boolean;
	language?: string;
	value?: string;
} = {} ) => {
	const settings = {
		controls: {
			[ CONTROL_NAME ]: {
				type: controlType,
				language,
				ai: { active: aiActive, type: controlType, language },
			},
		},
		get: jest.fn( () => value ),
	};

	return {
		model: { id: ELEMENT_ID },
		settings,
	};
};

describe( 'v3-code-control handler', () => {
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

	it( 'reads the current value and language of a valid V3 code control', () => {
		// Arrange
		const container = createContainer( { value: '.bar {}', language: 'css' } );
		getContainer.mockReturnValue( container );

		// Act
		const result = getCodeControlValue( {
			elementId: ELEMENT_ID,
			controlName: CONTROL_NAME,
		} );

		// Assert
		expect( result ).toEqual( {
			elementId: ELEMENT_ID,
			controlName: CONTROL_NAME,
			controlType: 'code',
			language: 'css',
			value: '.bar {}',
		} );
	} );

	it( 'writes through document/elements/settings with external: true for one undo step', async () => {
		// Arrange
		const container = createContainer();
		getContainer.mockReturnValue( container );

		// Act
		const result = await setCodeControlValue( {
			elementId: ELEMENT_ID,
			controlName: CONTROL_NAME,
			value: '.baz {}',
		} );

		// Assert
		expect( run ).toHaveBeenCalledWith( 'document/elements/settings', {
			container,
			settings: { [ CONTROL_NAME ]: '.baz {}' },
			options: { external: true },
		} );
		expect( result ).toEqual( {
			success: true,
			elementId: ELEMENT_ID,
			controlName: CONTROL_NAME,
			controlType: 'code',
			language: 'css',
			value: '.baz {}',
		} );
	} );

	it( 'stores the value as-is without wysiwyg newline normalization', async () => {
		// Arrange
		const container = createContainer();
		getContainer.mockReturnValue( container );

		// Act
		await setCodeControlValue( {
			elementId: ELEMENT_ID,
			controlName: CONTROL_NAME,
			value: 'line1\nline2',
		} );

		// Assert
		expect( run ).toHaveBeenCalledWith(
			'document/elements/settings',
			expect.objectContaining( {
				settings: { [ CONTROL_NAME ]: 'line1\nline2' },
			} )
		);
	} );

	it( 'rejects missing elements', async () => {
		// Arrange
		getContainer.mockReturnValue( null );

		// Act / Assert
		await expect(
			handleCodeControlTool( {
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
			handleCodeControlTool( {
				action: 'set',
				elementId: ELEMENT_ID,
				controlName: CONTROL_NAME,
				value: 'x',
			} )
		).rejects.toThrow( /atomic element/ );
		expect( run ).not.toHaveBeenCalled();
	} );

	it( 'rejects non-code controls', async () => {
		// Arrange
		const container = createContainer( { controlType: 'media' } );
		getContainer.mockReturnValue( container );

		// Act / Assert
		await expect(
			handleCodeControlTool( {
				action: 'get',
				elementId: ELEMENT_ID,
				controlName: CONTROL_NAME,
			} )
		).rejects.toThrow( /not a V3 code control/ );
	} );

	it( 'rejects controls without AI code support', async () => {
		// Arrange
		const container = createContainer( { aiActive: false } );
		getContainer.mockReturnValue( container );

		// Act / Assert
		await expect(
			handleCodeControlTool( {
				action: 'get',
				elementId: ELEMENT_ID,
				controlName: CONTROL_NAME,
			} )
		).rejects.toThrow( /does not have AI code support/ );
	} );
} );
