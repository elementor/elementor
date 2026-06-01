import * as React from 'react';
import { createMockPropType } from 'test-utils';
import { PropKeyProvider, PropProvider, usePropContext } from '@elementor/editor-controls';
import { createPropUtils, type ObjectPropType, type PropValue } from '@elementor/editor-props';
import { z } from '@elementor/schema';
import { renderHook } from '@testing-library/react';

import { TransformableObjectBridge } from '../transformable-object-bridge';

const QUERY_BIND = 'query';
const LOOP_QUERY_KEY = 'loop-query';

const loopQueryPropUtils = createPropUtils( LOOP_QUERY_KEY, z.record( z.string(), z.unknown() ) );

const loopQueryPropType: ObjectPropType = createMockPropType( {
	kind: 'object',
	key: LOOP_QUERY_KEY,
	shape: {
		source: createMockPropType( { kind: 'plain', key: 'string' } ),
	},
} );

const innerBag: Record< string, PropValue > = {
	source: { $$type: 'string', value: 'post' },
};

function createWrapper( {
	parentValue,
	setValue = jest.fn(),
}: {
	parentValue: Record< string, PropValue | null >;
	setValue?: jest.Mock;
} ) {
	const outerPropType: ObjectPropType = createMockPropType( {
		kind: 'object',
		key: '',
		shape: { [ QUERY_BIND ]: loopQueryPropType },
	} );

	return function Wrapper( { children }: { children: React.ReactNode } ) {
		return (
			<PropProvider propType={ outerPropType } value={ parentValue } setValue={ setValue }>
				<PropKeyProvider bind={ QUERY_BIND }>
					<TransformableObjectBridge>{ children }</TransformableObjectBridge>
				</PropKeyProvider>
			</PropProvider>
		);
	};
}

describe( 'TransformableObjectBridge', () => {
	it( 'unwraps a transformable object envelope into inner field bag', () => {
		const wrapper = createWrapper( {
			parentValue: {
				[ QUERY_BIND ]: loopQueryPropUtils.create( innerBag ),
			},
		} );

		const { result } = renderHook( () => usePropContext(), { wrapper } );

		expect( result.current.propType ).toBe( loopQueryPropType );
		expect( result.current.value ).toEqual( innerBag );
	} );

	it( 're-wraps inner bag edits as a transformable object envelope', () => {
		const setValue = jest.fn();
		const envelope = loopQueryPropUtils.create( innerBag );
		const wrapper = createWrapper( {
			parentValue: {
				[ QUERY_BIND ]: envelope,
			},
			setValue,
		} );
		const { result } = renderHook( () => usePropContext(), { wrapper } );

		result.current.setValue( { source: { $$type: 'string', value: 'page' } } );

		expect( setValue ).toHaveBeenCalledWith(
			{
				[ QUERY_BIND ]: loopQueryPropUtils.create(
					{ source: { $$type: 'string', value: 'page' } },
					{ base: envelope }
				),
			},
			undefined,
			expect.objectContaining( { bind: QUERY_BIND } )
		);
	} );

	it( 'unwraps object variant when parent prop type is a union', () => {
		const queryUnionPropType = createMockPropType( {
			kind: 'union',
			key: 'union',
			prop_types: {
				[ LOOP_QUERY_KEY ]: loopQueryPropType,
				dynamic: createMockPropType( { kind: 'plain', key: 'dynamic' } ),
			},
		} );

		const outerPropType = createMockPropType( {
			kind: 'object',
			key: '',
			shape: { [ QUERY_BIND ]: queryUnionPropType },
		} );

		const wrapper = ( { children }: { children: React.ReactNode } ) => (
			<PropProvider
				propType={ outerPropType }
				value={ { [ QUERY_BIND ]: loopQueryPropUtils.create( innerBag ) } }
				setValue={ jest.fn() }
			>
				<PropKeyProvider bind={ QUERY_BIND }>
					<TransformableObjectBridge>{ children }</TransformableObjectBridge>
				</PropKeyProvider>
			</PropProvider>
		);

		const { result } = renderHook( () => usePropContext(), { wrapper } );

		expect( result.current.propType ).toBe( loopQueryPropType );
		expect( result.current.value ).toEqual( innerBag );
	} );

	it( 'unwraps inner bag without prop utils cache registration', () => {
		const wrapper = createWrapper( {
			parentValue: {
				[ QUERY_BIND ]: {
					$$type: LOOP_QUERY_KEY,
					value: innerBag,
				},
			},
		} );

		const { result } = renderHook( () => usePropContext(), { wrapper } );

		expect( result.current.value ).toEqual( innerBag );
	} );
} );
