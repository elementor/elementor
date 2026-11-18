import { getMotionEffects, handleMotionEffectsTool, setMotionEffects } from '../handler';

const ELEMENT_ID = 'el-motion-1';

const createContainer = ( elType = 'widget' ) => ( {
	model: { get: ( key: string ) => ( 'elType' === key ? elType : 'heading' ) },
	settings: {
		controls: {
			_animation: { type: 'animation' },
			motion_fx_motion_fx_scrolling: { type: 'switcher' },
			_css_classes: { type: 'text' },
		},
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
					heading: {
						controls: {
							section_effects: { name: 'section_effects', section: 'section_effects', type: 'section' },
							_animation: {
								name: '_animation',
								section: 'section_effects',
								type: 'animation',
								default: '',
							},
							motion_fx_motion_fx_scrolling: {
								name: 'motion_fx_motion_fx_scrolling',
								section: 'section_effects',
								type: 'switcher',
								default: '',
							},
						},
					},
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

	it( 'rejects document containers', async () => {
		getContainer.mockReturnValue( createContainer( 'document' ) );
		await expect(
			handleMotionEffectsTool( { action: 'set', elementId: ELEMENT_ID, settings: { _animation: 'fadeIn' } } )
		).rejects.toThrow( /document/ );
	} );

	it( 'rejects settings outside the motion scope', async () => {
		await expect(
			setMotionEffects( { elementId: ELEMENT_ID, settings: { _css_classes: 'oops' } } )
		).rejects.toThrow( /not a entrance motion control/ );
	} );

	it( 'rejects Pro motion_fx keys on Core', async () => {
		hasPro.mockReturnValue( false );
		await expect(
			setMotionEffects( { elementId: ELEMENT_ID, settings: { motion_fx_motion_fx_scrolling: 'yes' } } )
		).rejects.toThrow( /Pro-only/ );
	} );

	it( 'clears entrance keys to widget defaults without Pro keys', async () => {
		await handleMotionEffectsTool( { action: 'clear', elementId: ELEMENT_ID, scope: 'entrance' } );
		expect( run ).toHaveBeenCalledWith(
			'document/elements/settings',
			expect.objectContaining( {
				settings: { _animation: '' },
			} )
		);
	} );
} );
