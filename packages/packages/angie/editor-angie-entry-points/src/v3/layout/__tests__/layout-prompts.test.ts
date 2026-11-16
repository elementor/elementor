import { buildAngieV3LayoutPrompt } from '../../../prompts';

describe( 'buildAngieV3LayoutPrompt', () => {
	it( 'includes document type and position for a new layout', () => {
		// Act
		const prompt = buildAngieV3LayoutPrompt( {
			mode: 'new-layout',
			documentType: 'page',
			at: 2,
		} );

		// Assert
		expect( prompt ).toContain( 'page' );
		expect( prompt ).toContain( '2' );
	} );

	it( 'includes the container id for variation mode', () => {
		// Act
		const prompt = buildAngieV3LayoutPrompt( {
			mode: 'container-variation',
			targetContainerId: 'abc123',
			documentType: 'page',
		} );

		// Assert
		expect( prompt ).toContain( 'abc123' );
	} );
} );
