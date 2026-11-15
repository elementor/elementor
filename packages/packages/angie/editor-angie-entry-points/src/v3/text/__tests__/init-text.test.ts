import { clearV3AngieControls, getV3AngieControl } from '../../registry';
import { initV3TextControls } from '../init-text';

describe( 'initV3TextControls', () => {
	beforeEach( () => {
		clearV3AngieControls();
	} );

	afterEach( () => {
		clearV3AngieControls();
	} );

	it( 'registers text, textarea, and wysiwyg control handlers', () => {
		// Act
		initV3TextControls();

		// Assert
		expect( getV3AngieControl( 'text' ) ).toBeDefined();
		expect( getV3AngieControl( 'textarea' ) ).toBeDefined();
		expect( getV3AngieControl( 'wysiwyg' ) ).toBeDefined();
	} );

	it( 'buildPrompt produces expected content with elementId and controlName', () => {
		// Arrange
		initV3TextControls();
		const registration = getV3AngieControl( 'text' );

		// Act
		const prompt = registration?.buildPrompt( {
			type: 'text',
			controlType: 'text',
			getControlValue: () => 'Hello',
			context: {
				elementId: 'el-1',
				controlName: 'title',
			},
		} );

		// Assert
		expect( prompt ).toContain( 'el-1' );
		expect( prompt ).toContain( 'title' );
		expect( prompt ).not.toContain( 'Hello' );
	} );

	it( 'getButtonLabel returns Write with AI when value matches default', () => {
		// Arrange
		initV3TextControls();
		const registration = getV3AngieControl( 'text' );

		// Act
		const label = registration?.getButtonLabel?.( {
			getControlValue: () => 'default',
			additionalOptions: { defaultValue: 'default' },
		} );

		// Assert
		expect( label ).toBe( 'Write with AI' );
	} );

	it( 'getButtonLabel returns Edit with AI when value differs from default', () => {
		// Arrange
		initV3TextControls();
		const registration = getV3AngieControl( 'text' );

		// Act
		const label = registration?.getButtonLabel?.( {
			getControlValue: () => 'changed',
			additionalOptions: { defaultValue: 'default' },
		} );

		// Assert
		expect( label ).toBe( 'Edit with AI' );
	} );
} );
