import { getMotionEffects, handleMotionEffectsTool, setMotionEffects } from '../handler';

const ELEMENT_ID = 'el-motion-1';

const createContainer = () => ( {
	model: { get: () => 'heading' },
	settings: {
		controls: { _animation: { type: 'animation' }, motion_fx_motion_fx_scrolling: { type: 'switcher' } },
		get: jest.fn( () => 'fadeIn' ),
	},
} );

describe( 'v3-motion-effects handler', () => {
	let run: jest.Mock;
	let getContainer: jest.Mock;
	let isAtomicWidget: jest.Mock;
	let hasPro: jest.Mock;

	beforeEach( () => {
		run = jest.fn( () => Promise.resolve() );
		getContainer = jest.fn( () => createContainer() );
		isAtomicWidget = jest.fn( () => false );
		hasPro = jest.fn( () => false );
		Object.defineProperty( window, '$e', { configurable: true, value: { run } } );
		Object.defineProperty( window, 'elementor', {
			configurable: true,
			value: {
				getContainer,
				helpers: { isAtomicWidget, hasPro },
				widgetsCache: {
					heading: { controls: { _animation: { name: '_animation', section: 'section_effects' } } },
				},
			},
		} );
	} );

	afterEach( () => {
		Reflect.deleteProperty( window, '$e' );
		Reflect.deleteProperty( window, 'elementor' );
	} );

	it( 'reads widget entrance animation keys', () => {
		const result = getMotionEffects( { elementId: ELEMENT_ID, scope: 'entrance' } );
		expect( result.settings ).toEqual( expect.objectContaining( { _animation: 'fadeIn' } ) );
	} );

	it( 'writes through document/elements/settings once', async () => {
		const container = createContainer();
		getContainer.mockReturnValue( container );
		await setMotionEffects( { elementId: ELEMENT_ID, settings: { _animation: 'fadeInUp' } } );
		expect( run ).toHaveBeenCalledTimes( 1 );
		expect( run ).toHaveBeenCalledWith( 'document/elements/settings', {
			container,
			settings: { _animation: 'fadeInUp' },
			options: { external: true },
		} );
	} );

	it( 'rejects atomic elements', async () => {
		isAtomicWidget.mockReturnValue( true );
		await expect(
			handleMotionEffectsTool( { action: 'set', elementId: ELEMENT_ID, settings: { _animation: 'fadeIn' } } )
		).rejects.toThrow( /atomic element/ );
	} );
} );
