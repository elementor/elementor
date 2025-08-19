import React, { useState, useEffect } from 'react';
import { render, screen } from '@testing-library/react';
import useAnimationPrompt from '../../../../../../../../../modules/ai/assets/js/editor/hooks/use-animation-prompt';
import usePrompt from '../../../../../../../../../modules/ai/assets/js/editor/hooks/use-prompt';

jest.mock( '../../../../../../../../../modules/ai/assets/js/editor/hooks/use-prompt', () => ( {
	__esModule: true,
	default: jest.fn(),
} ) );

// Mock usePrompt for consistent behavior
usePrompt.mockImplementation( () => ( {
	isLoading: false,
	error: null,
	data: {
		result: `
{
  "motion_fx": {
    "scrolling_effects": {
      "enabled": {
        "motion_fx_motion_fx_scrolling": "yes"
      },
      "scale_effect": {
        "enabled": {
          "motion_fx_scale_effect": "yes"
        },
        "motion_fx_scale_direction": "in-out",
        "motion_fx_scale_speed": {
          "unit": "px",
          "size": 2,
          "sizes": []
        },
        "motion_fx_scale_range": {
          "unit": "%",
          "sizes": {
            "start": 0,
            "end": 100
          }
        }
      }
    },
    "entrance_effects": {
      "_animation": "fadeIn",
      "_animation_duration": {
        "animation_duration": "fast"
      }
    }
  }
}`,
	},
	setResult: () => {},
	reset: () => {},
	send: () => {},
	sendUsageData: () => {},
} ) );

const widgetType = 'widgetType';
global.elementor = {
	widgetsCache: {
		[ widgetType ]: {
			controls: {
				motion_fx_motion_fx_scrolling: {
					label: 'Scrolling Effects',
				},
				motion_fx_scale_effect: {
					label: 'Scale',
				},
				_animation: {
					label: 'Entrance Animation',
				},
			},
		},
	},
};

describe( 'digestResult', () => {
	it( 'should process AI effect result correctly', () => {
		// Test Component to use the hook
		const TestComponent = () => {
			const { data } = useAnimationPrompt( 'hover', 'widgetType', '' );
			const [ result, setResult ] = useState( null );

			useEffect( () => {
				// Only update state if `data.result` is different from the current `result`
				if ( data?.result && ! result ) {
					setResult( data.result );
				}
			}, [ data, result ] );

			return <div data-testid="result">{ JSON.stringify( result ) }</div>;
		};

		// Render the Test Component
		render( <TestComponent /> );

		// Expected Result
		const expected = {
			motion_fx_motion_fx_scrolling: {
				isParent: true,
				label: 'Scrolling Effects',
				value: 'yes',
				tabs: 0,
			},
			motion_fx_scale_effect: {
				isParent: false,
				label: 'Scale',
				value: 'yes',
				tabs: 1,
			},
			motion_fx_scale_direction: {
				value: 'in-out',
			},
			motion_fx_scale_speed: {
				value: {
					unit: 'px',
					size: 2,
					sizes: [],
				},
			},
			motion_fx_scale_range: {
				value: {
					unit: '%',
					sizes: {
						start: 0,
						end: 100,
					},
				},
			},
			_animation: {
				isParent: true,
				label: 'Entrance Animation',
				value: 'fadeIn',
				tabs: 0,
			},
			fadeIn: {
				isParent: false,
				label: 'fadeIn',
				tabs: 1,
			},
			animation_duration: {
				value: 'fast',
			},
		};

		// Assert
		const resultElement = screen.getByTestId( 'result' );
		expect( JSON.parse( resultElement.textContent ) ).toEqual( expected );
	} );
} );
