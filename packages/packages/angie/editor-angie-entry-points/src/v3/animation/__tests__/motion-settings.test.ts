import { gatherMotionEffectSettings, summarizeMotionSettings } from '../motion-settings';

describe( 'motion-settings helpers', () => {
	afterEach( () => {
		Reflect.deleteProperty( window, 'elementor' );
	} );

	it( 'gathers section_effects values for entrance animation ai type', () => {
		Object.defineProperty( window, 'elementor', {
			configurable: true,
			value: {
				widgetsCache: {
					heading: {
						controls: { _animation: { name: '_animation', section: 'section_effects' } },
					},
				},
			},
		} );

		const view = {
			options: {
				model: { get: () => undefined },
				container: {
					type: 'widget',
					model: { get: () => 'heading' },
					settings: { get: ( key: string ) => ( '_animation' === key ? 'fadeIn' : undefined ) },
				},
			},
		};

		expect( gatherMotionEffectSettings( view, 'animation' ) ).toEqual( { _animation: 'fadeIn' } );
	} );
} );
