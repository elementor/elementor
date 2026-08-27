import { buildAngiePrompt } from '../build-angie-prompt';

describe( 'buildAngiePrompt', () => {
	it( 'prefixes the violation text with Help me fix', () => {
		expect( buildAngiePrompt( 'Page has no title.' ) ).toBe( 'Help me fix: Page has no title.' );
	} );
} );
