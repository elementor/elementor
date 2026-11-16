import { generatePrompt } from '../prompt';

const mockPromptParts: string[] = [];

jest.mock( '@elementor/editor-mcp', () => ( {
	toolPrompts: () => {
		const record = ( ...args: unknown[] ) => {
			mockPromptParts.push( ...args.filter( ( arg ): arg is string => 'string' === typeof arg ) );
		};

		return {
			description: record,
			parameter: record,
			example: record,
			instruction: record,
			prompt: () => mockPromptParts.join( '\n' ),
		};
	},
} ) );

describe( 'configure-element prompt', () => {
	beforeEach( () => {
		mockPromptParts.length = 0;
	} );

	it( 'should always point agents at the find-icons tool for the svg property', () => {
		// Act.
		const prompt = generatePrompt();

		// Assert.
		expect( prompt ).toContain( '# Icons (the `svg` property on e-svg)' );
		expect( prompt ).toContain( 'find-icons' );
	} );
} );
