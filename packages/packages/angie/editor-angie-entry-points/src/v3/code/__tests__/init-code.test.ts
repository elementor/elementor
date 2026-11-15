import { clearV3AngieControls, getV3AngieControl } from '../../registry';
import { initV3CodeControls } from '../init-code';

describe( 'initV3CodeControls', () => {
	beforeEach( () => {
		clearV3AngieControls();
	} );

	afterEach( () => {
		clearV3AngieControls();
	} );

	it( 'registers the code control handler', () => {
		// Act
		initV3CodeControls();

		// Assert
		expect( getV3AngieControl( 'code' ) ).toBeDefined();
	} );

	it( 'buildPrompt produces expected content with elementId, controlName, and language', () => {
		// Arrange
		initV3CodeControls();
		const registration = getV3AngieControl( 'code' );

		// Act
		const prompt = registration?.buildPrompt( {
			type: 'code',
			controlType: 'code',
			getControlValue: () => '.foo {}',
			additionalOptions: { codeLanguage: 'css' },
			context: {
				elementId: 'el-1',
				controlName: 'custom_css',
			},
		} );

		// Assert
		expect( prompt ).toContain( 'el-1' );
		expect( prompt ).toContain( 'custom_css' );
		expect( prompt ).toContain( 'Language: css.' );
		expect( prompt ).not.toContain( '.foo' );
	} );

	it( 'getButtonLabel always returns Code with AI', () => {
		// Arrange
		initV3CodeControls();
		const registration = getV3AngieControl( 'code' );

		// Act
		const label = registration?.getButtonLabel?.( {
			getControlValue: () => 'changed',
			additionalOptions: { defaultValue: 'default' },
		} );

		// Assert
		expect( label ).toBe( 'Code with AI' );
	} );
} );
