import * as React from 'react';
import { createMockPropType } from 'test-utils';
import { PropKeyProvider, PropProvider, usePropContext } from '@elementor/editor-controls';
import { type ObjectPropType, type PropValue } from '@elementor/editor-props';
import { renderHook } from '@testing-library/react';

import { TransformableObjectBridge } from '../transformable-object-bridge';

const QUERY_BIND = 'query';

const loopQueryPropType: ObjectPropType = createMockPropType( {
	kind: 'object',
	key: 'loop-query',
	shape: {
		source: createMockPropType( { kind: 'plain', key: 'string' } ),
	},
} );

const innerBag: Record< string, PropValue > = {
	source: { $$type: 'string', value: 'post' },
};

function createWrapper( {
	parentValue,
	parentPropType,
	setValue = jest.fn(),
}: {
	parentValue: Record< string, PropValue | null >;
	parentPropType: ObjectPropType;
	setValue?: jest.Mock;
} ) {
	const outerPropType: ObjectPropType = createMockPropType( {
		kind: 'object',
		key: '',
		shape: { [ QUERY_BIND ]: parentPropType },
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
			parentPropType: loopQueryPropType,
			parentValue: {
				[ QUERY_BIND ]: { $$type: 'loop-query', value: innerBag },
			},
		} );

		const { result } = renderHook( () => usePropContext(), { wrapper } );

		expect( result.current.propType ).toBe( loopQueryPropType );
		expect( result.current.value ).toEqual( innerBag );
	} );

	it( 're-wraps inner bag edits as a transformable object envelope', () => {
		const setValue = jest.fn();
		const wrapper = createWrapper( {
			parentPropType: loopQueryPropType,
			parentValue: {
				[ QUERY_BIND ]: { $$type: 'loop-query', value: innerBag },
			},
			setValue,
		} );
		const { result } = renderHook( () => usePropContext(), { wrapper } );

		result.current.setValue( { source: { $$type: 'string', value: 'page' } } );

		expect( setValue ).toHaveBeenCalledWith(
			{
				[ QUERY_BIND ]: {
					$$type: 'loop-query',
					value: { source: { $$type: 'string', value: 'page' } },
				},
			},
			undefined,
			expect.objectContaining( { bind: QUERY_BIND } )
		);
	} );

	it( 'resolves object variant from a union parent prop type', () => {
		const unionPropType = createMockPropType( {
			kind: 'union',
			prop_types: { 'loop-query': loopQueryPropType },
		} );
		const wrapper = createWrapper( {
			parentPropType: unionPropType,
			parentValue: {
				[ QUERY_BIND ]: { $$type: 'loop-query', value: innerBag },
			},
		} );

		const { result } = renderHook( () => usePropContext(), { wrapper } );

		expect( result.current.propType ).toBe( loopQueryPropType );
		expect( result.current.value ).toEqual( innerBag );
	} );
} );
