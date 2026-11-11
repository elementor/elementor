import { buildAngieTextPrompt } from 'elementor/modules/ai/assets/js/editor/angie/text-prompts';

describe( 'buildAngieTextPrompt', () => {
	it( 'includes element, control, current value, and the write-back tool name', () => {
		// Arrange / Act
		const prompt = buildAngieTextPrompt( {
			elementId: 'el-1',
			controlName: 'title',
			controlType: 'text',
			currentValue: 'Hello',
		} );

		// Assert
		expect( prompt ).toContain( 'el-1' );
		expect( prompt ).toContain( 'title' );
		expect( prompt ).toContain( 'Hello' );
		expect( prompt ).toContain( 'v3-text-control' );
		expect( prompt ).toContain( 'change its tone' );
	} );

	it( 'mentions an empty control when there is no current value', () => {
		// Arrange / Act
		const prompt = buildAngieTextPrompt( {
			elementId: 'el-1',
			controlName: 'title',
			controlType: 'textarea',
			currentValue: '   ',
		} );

		// Assert
		expect( prompt ).toContain( 'currently empty' );
		expect( prompt ).toContain( 'Write new text' );
	} );
} );
