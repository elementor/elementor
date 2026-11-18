jest.mock( '../behavior/create-behavior-class', () => ( {
	getAngieControlBehaviorClass: jest.fn( () => function SentinelBehavior() {} ),
} ) );

jest.mock( '../is-angie-entry-points-enabled', () => ( {
	isAngieEntryPointsEnabled: jest.fn( () => true ),
} ) );

import { applyAngieControlBehavior } from '../apply-angie-control-behavior';
import { getAngieControlBehaviorClass } from '../behavior/create-behavior-class';
import { isAngieEntryPointsEnabled } from '../is-angie-entry-points-enabled';
import { clearV3AngieControls, registerV3AngieControl } from '../registry';

const buildPrompt = jest.fn( () => 'prompt' );

function createView(
	overrides: {
		ai?: { active?: boolean; type?: string; language?: string };
		container?: Record< string, unknown > | null;
		labelBlock?: boolean;
		controlType?: string;
	} = {}
) {
	const container =
		overrides.container === null
			? undefined
			: {
					id: 'element-1',
					type: 'widget',
					document: { config: { type: 'page' } },
					args: { model: { get: ( key: string ) => ( key === 'elType' ? 'widget' : 'heading' ) } },
					settings: { get: () => 'value' },
					...overrides.container,
			  };

	return {
		options: {
			model: {
				get: ( key: string ) => {
					const map: Record< string, unknown > = {
						ai: overrides.ai ?? { active: true, type: 'text' },
						type: overrides.controlType ?? 'text',
						name: 'title',
						label_block: overrides.labelBlock ?? false,
						default: '',
						language: 'css',
					};

					return map[ key ];
				},
			},
			container,
		},
		getControlValue: jest.fn( () => 'control value' ),
	};
}

describe( 'applyAngieControlBehavior', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		clearV3AngieControls();
		jest.mocked( isAngieEntryPointsEnabled ).mockReturnValue( true );
		registerV3AngieControl( { types: [ 'text' ], buildPrompt } );
	} );

	afterEach( () => {
		clearV3AngieControls();
	} );

	it( 'applies Angie behavior when type registered, ai active, not repeater, and Show AI on', () => {
		// Arrange
		const behaviors = { existing: true };
		const view = createView();

		// Act
		const result = applyAngieControlBehavior( behaviors, view );

		// Assert
		expect( result.ai ).toEqual(
			expect.objectContaining( {
				behaviorClass: expect.any( Function ),
				type: 'text',
				controlType: 'text',
				buildPrompt,
			} )
		);
		expect( getAngieControlBehaviorClass ).toHaveBeenCalled();
	} );

	it( 'skips when type is not registered', () => {
		// Arrange
		const behaviors = {};
		const view = createView( { ai: { active: true, type: 'media' } } );

		// Act
		const result = applyAngieControlBehavior( behaviors, view );

		// Assert
		expect( result ).toEqual( {} );
		expect( getAngieControlBehaviorClass ).not.toHaveBeenCalled();
	} );

	it( 'skips when ai.active is false', () => {
		// Arrange
		const behaviors = {};
		const view = createView( { ai: { active: false, type: 'text' } } );

		// Act
		const result = applyAngieControlBehavior( behaviors, view );

		// Assert
		expect( result ).toEqual( {} );
	} );

	it( 'skips repeater items', () => {
		// Arrange
		const behaviors = {};
		const view = createView( { container: { type: 'repeater' } } );

		// Act
		const result = applyAngieControlBehavior( behaviors, view );

		// Assert
		expect( result ).toEqual( {} );
	} );

	it( 'applies animation behavior with label block and motion additional options', () => {
		// Arrange
		registerV3AngieControl( {
			types: [ 'animation' ],
			forceLabelBlock: true,
			buildPrompt,
			getAdditionalOptions: () => ( { animationType: 'entrance', widgetType: 'heading' } ),
			getGetControlValue: () => () => ( { _animation: 'fadeIn' } ),
		} );
		const behaviors = {};
		const view = createView( { ai: { active: true, type: 'animation' }, controlType: 'animation' } );

		// Act
		const result = applyAngieControlBehavior( behaviors, view );

		// Assert
		expect( result.ai ).toEqual(
			expect.objectContaining( {
				isLabelBlock: true,
				additionalOptions: expect.objectContaining( {
					animationType: 'entrance',
					widgetType: 'heading',
				} ),
			} )
		);
		expect( ( result.ai as { getControlValue: () => unknown } ).getControlValue() ).toEqual( {
			_animation: 'fadeIn',
		} );
	} );

	it( 'skips when isAngieEntryPointsEnabled returns false', () => {
		// Arrange
		jest.mocked( isAngieEntryPointsEnabled ).mockReturnValue( false );
		const behaviors = {};
		const view = createView();

		// Act
		const result = applyAngieControlBehavior( behaviors, view );

		// Assert
		expect( result ).toEqual( {} );
	} );
} );
