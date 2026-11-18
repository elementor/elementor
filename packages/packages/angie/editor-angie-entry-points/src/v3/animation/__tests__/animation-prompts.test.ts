import { buildAngieV3AnimationPrompt } from '../../../prompts';

describe( 'buildAngieV3AnimationPrompt', () => {
	it( 'mentions v3-motion-effects for entrance scope', () => {
		const prompt = buildAngieV3AnimationPrompt( {
			elementId: 'e1',
			controlName: 'ai_animation',
			animationType: 'entrance',
		} );

		expect( prompt ).toContain( 'entrance' );
		expect( prompt ).toContain( 'v3-motion-effects' );
	} );
} );
