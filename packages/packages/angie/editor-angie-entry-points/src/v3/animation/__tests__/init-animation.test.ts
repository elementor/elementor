import { clearV3AngieControls, getV3AngieControl } from '../../registry';
import { initV3AnimationControls } from '../init-animation';

describe( 'initV3AnimationControls', () => {
	beforeEach( () => {
		clearV3AngieControls();
	} );

	afterEach( () => {
		clearV3AngieControls();
	} );

	it( 'registers animation and hover_animation control handlers', () => {
		initV3AnimationControls();

		expect( getV3AngieControl( 'animation' ) ).toBeDefined();
		expect( getV3AngieControl( 'hover_animation' ) ).toBeDefined();
	} );

	it( 'buildPrompt includes element id, scope, and motion summary', () => {
		initV3AnimationControls();
		const registration = getV3AngieControl( 'animation' );

		const prompt = registration?.buildPrompt( {
			type: 'animation',
			controlType: 'animation',
			getControlValue: () => ( { _animation: 'fadeIn' } ),
			additionalOptions: { animationType: 'entrance' },
			context: {
				elementId: 'el-anim-1',
				controlName: 'ai_animation',
			},
		} );

		expect( prompt ).toContain( 'el-anim-1' );
		expect( prompt ).toContain( 'v3-motion-effects' );
		expect( prompt ).toContain( '_animation' );
	} );

	it( 'getButtonLabel returns Animate with AI', () => {
		initV3AnimationControls();
		const registration = getV3AngieControl( 'animation' );

		expect(
			registration?.getButtonLabel?.( {
				getControlValue: () => ( {} ),
			} )
		).toBe( 'Animate with AI' );
	} );
} );