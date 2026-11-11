import { ANGIE_PROMPTS } from '../prompts';

const ELEMENT_ID = 'abc123';
const SELECTED_ELEMENT_ID = 'selected-1';

describe( 'ANGIE_PROMPTS', () => {
	it( 'builds the text prompt', () => {
		// Act
		const prompt = ANGIE_PROMPTS.text( ELEMENT_ID );

		// Assert
		expect( prompt ).toBe( `At element ${ ELEMENT_ID } I want: ` );
	} );

	it( 'builds the image prompt', () => {
		// Act
		const prompt = ANGIE_PROMPTS.image( ELEMENT_ID );

		// Assert
		expect( prompt ).toBe( `At element ${ ELEMENT_ID }, image, I want: ` );
	} );

	it( 'builds the named image prompt', () => {
		// Act
		const prompt = ANGIE_PROMPTS.namedImage( ELEMENT_ID, 'logo' );

		// Assert
		expect( prompt ).toBe( `At element ${ ELEMENT_ID }, image "logo", I want: ` );
	} );

	it( 'builds the background image prompt', () => {
		// Act
		const prompt = ANGIE_PROMPTS.backgroundImage( ELEMENT_ID );

		// Assert
		expect( prompt ).toBe( `At element ${ ELEMENT_ID }, background image, I want: ` );
	} );

	describe( 'controlHeader', () => {
		it.each( [
			{
				source: 'text',
				params: {
					elementId: ELEMENT_ID,
					controlType: 'inline-editing',
					bind: 'title',
					path: [ 'title' ],
				},
				prompt: `At element ${ ELEMENT_ID } I want: `,
			},
			{
				source: 'image',
				params: {
					elementId: ELEMENT_ID,
					controlType: 'image',
					bind: 'image',
					path: [ 'image' ],
				},
				prompt: `At element ${ ELEMENT_ID }, image, I want: `,
			},
			{
				source: 'named image',
				params: {
					elementId: ELEMENT_ID,
					controlType: 'image',
					bind: 'logo',
					path: [ 'logo' ],
				},
				prompt: `At element ${ ELEMENT_ID }, image "logo", I want: `,
			},
			{
				source: 'background image',
				params: {
					elementId: SELECTED_ELEMENT_ID,
					controlType: 'image',
					bind: 'image',
					path: [ 'background', 'background-overlay', '0', 'image' ],
				},
				prompt: `At element ${ SELECTED_ELEMENT_ID }, background image, I want: `,
			},
		] )( 'returns the $source prompt', ( { params, prompt } ) => {
			// Act
			const result = ANGIE_PROMPTS.controlHeader( params );

			// Assert
			expect( result ).toBe( prompt );
		} );

		it( 'returns null for a control type without a prompt', () => {
			// Act
			const result = ANGIE_PROMPTS.controlHeader( {
				elementId: ELEMENT_ID,
				controlType: 'link',
				bind: 'link',
				path: [ 'link' ],
			} );

			// Assert
			expect( result ).toBeNull();
		} );
	} );

	it( 'builds the style tab prompt', () => {
		// Act
		const prompt = ANGIE_PROMPTS.styleTab( { elementId: 'el-styles' } );

		// Assert
		expect( prompt ).toBe( 'At element el-styles, styles, I want: ' );
	} );

	it( 'builds the class selector prompt', () => {
		// Act
		const prompt = ANGIE_PROMPTS.classSelector( 'element-1', 'My Class' );

		// Assert
		expect( prompt ).toBe( 'At element element-1, class "My Class", I want: ' );
	} );

	it( 'builds the class manager prompt', () => {
		// Act
		const prompt = ANGIE_PROMPTS.classManager();

		// Assert
		expect( prompt ).toBe( 'In the design system global classes, I want: ' );
	} );

	it( 'builds the interactions prompt', () => {
		// Act
		const prompt = ANGIE_PROMPTS.interactions( { elementId: 'element-88' } );

		// Assert
		expect( prompt ).toBe( 'At element element-88, interactions, I want: ' );
	} );

	describe( 'variableForm', () => {
		it.each( [
			{
				scenario: 'creation without a label',
				props: { variableType: 'color' },
				prompt: 'For new color variable I want: ',
			},
			{
				scenario: 'edit with a label',
				props: { variableType: 'color', variableId: 'var-1', label: 'Primary' },
				prompt: 'For color variable "Primary" I want: ',
			},
		] )( 'builds the $scenario prompt', ( { props, prompt } ) => {
			// Act
			const result = ANGIE_PROMPTS.variableForm( props );

			// Assert
			expect( result ).toBe( prompt );
		} );
	} );

	it( 'builds the variables manager prompt', () => {
		// Act
		const prompt = ANGIE_PROMPTS.variablesManager();

		// Assert
		expect( prompt ).toBe( 'In the design system variables, I want: ' );
	} );

	it( 'builds the component instance prompt', () => {
		// Act
		const prompt = ANGIE_PROMPTS.componentInstance( { componentId: 'comp-1', elementId: 'el-9' } );

		// Assert
		expect( prompt ).toBe( 'At component comp-1 (instance el-9) I want: ' );
	} );

	it( 'builds the components tab prompt', () => {
		// Act
		const prompt = ANGIE_PROMPTS.componentsTab();

		// Assert
		expect( prompt ).toBe( 'In components, I want: ' );
	} );
} );
