import { buildAngieV3CodePrompt } from '../../../prompts';

describe( 'buildAngieV3CodePrompt', () => {
	it( 'includes element, control, language, and the write-back tool name without embedding the current value', () => {
		// Arrange / Act
		const prompt = buildAngieV3CodePrompt( {
			elementId: 'el-1',
			controlName: 'custom_css',
			controlType: 'code',
			language: 'css',
			currentValue: '.foo { color: red; }',
		} );

		// Assert
		expect( prompt ).toContain( 'el-1' );
		expect( prompt ).toContain( 'custom_css' );
		expect( prompt ).not.toContain( '.foo' );
		expect( prompt ).toContain( 'existing code' );
		expect( prompt ).toContain( 'action "get"' );
		expect( prompt ).toContain( 'action "set"' );
		expect( prompt ).toContain( 'v3-code-control' );
		expect( prompt ).toContain( 'Language: css.' );
		expect( prompt ).toContain( 'Write improved css' );
	} );

	it( 'mentions an empty control when there is no current value', () => {
		// Arrange / Act
		const prompt = buildAngieV3CodePrompt( {
			elementId: 'el-1',
			controlName: 'html',
			controlType: 'code',
			currentValue: '   ',
		} );

		// Assert
		expect( prompt ).toContain( 'currently empty' );
		expect( prompt ).toContain( 'Write new code' );
		expect( prompt ).toContain( 'Language is unspecified.' );
	} );
} );
