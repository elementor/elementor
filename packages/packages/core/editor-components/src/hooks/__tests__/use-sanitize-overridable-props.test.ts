import { renderHookWithStore } from 'test-utils';
import {
	__createStore,
	__dispatch as dispatch,
	__registerSlice as registerSlice,
	type SliceState,
	type Store,
} from '@elementor/store';

import { slice } from '../../store/store';
import { type OverridableProps, type PublishedComponent } from '../../types';
import { filterValidOverridableProps } from '../../utils/filter-valid-overridable-props';
import { useSanitizeOverridableProps } from '../use-sanitize-overridable-props';

jest.mock( '../../utils/filter-valid-overridable-props', () => ( {
	filterValidOverridableProps: jest.fn(),
} ) );

const mockFilterValidOverridableProps = jest.mocked( filterValidOverridableProps );

const MOCK_COMPONENT_ID = 123;
const MOCK_SECOND_COMPONENT_ID = 456;

function createMockOverridableProps(): OverridableProps {
	return {
		props: {
			'prop-1': {
				overrideKey: 'prop-1',
				label: 'Title',
				elementId: 'element-1',
				propKey: 'title',
				widgetType: 'e-heading',
				elType: 'widget',
				groupId: 'content',
				originValue: { $$type: 'string', value: 'Hello' },
			},
		},
		groups: {
			items: {
				content: { id: 'content', label: 'Content', props: [ 'prop-1' ] },
			},
			order: [ 'content' ],
		},
	};
}

function createMockComponent( id: number, overridableProps?: OverridableProps ): PublishedComponent {
	return {
		id,
		uid: `component-uid-${ id }`,
		name: `Component ${ id }`,
		overridableProps,
	};
}

describe( 'useSanitizeOverridableProps', () => {
	let store: Store< SliceState< typeof slice > >;

	beforeEach( () => {
		jest.clearAllMocks();
		registerSlice( slice );
		store = __createStore();
		dispatch( slice.actions.resetSanitizedComponents() );
	} );

	describe( 'caching mechanism', () => {
		it( 'should run sanitization logic only once per component', () => {
			// Arrange
			const mockOverridableProps = createMockOverridableProps();
			const mockComponent1 = createMockComponent( MOCK_COMPONENT_ID, mockOverridableProps );
			const mockComponent2 = createMockComponent( MOCK_SECOND_COMPONENT_ID, mockOverridableProps );
			dispatch( slice.actions.load( [ mockComponent1, mockComponent2 ] ) );
			mockFilterValidOverridableProps.mockReturnValue( mockOverridableProps );

			// Act
			renderHookWithStore( () => useSanitizeOverridableProps( MOCK_COMPONENT_ID, 'instance-1' ), store );

			// Assert - called twice on first render (effect + return)
			expect( mockFilterValidOverridableProps ).toHaveBeenCalledTimes( 2 );

			// Act
			renderHookWithStore( () => useSanitizeOverridableProps( MOCK_SECOND_COMPONENT_ID, 'instance-2' ), store );

			// Assert - called twice more (effect + return)
			expect( mockFilterValidOverridableProps ).toHaveBeenCalledTimes( 4 );

			// Act - re-render same components
			renderHookWithStore( () => useSanitizeOverridableProps( MOCK_COMPONENT_ID, 'instance-1' ), store );
			renderHookWithStore( () => useSanitizeOverridableProps( MOCK_SECOND_COMPONENT_ID, 'instance-2' ), store );

			// Assert - no additional calls because isSanitized returns overridableProps directly
			expect( mockFilterValidOverridableProps ).toHaveBeenCalledTimes( 4 );
		} );

		it( 'should re-run sanitization logic if sanitized components are reset', () => {
			// Arrange
			const mockOverridableProps = createMockOverridableProps();
			const mockComponent1 = createMockComponent( MOCK_COMPONENT_ID, mockOverridableProps );
			const mockComponent2 = createMockComponent( MOCK_SECOND_COMPONENT_ID, mockOverridableProps );
			dispatch( slice.actions.load( [ mockComponent1, mockComponent2 ] ) );
			mockFilterValidOverridableProps.mockReturnValue( mockOverridableProps );

			// Act
			renderHookWithStore( () => useSanitizeOverridableProps( MOCK_COMPONENT_ID, 'instance-1' ), store );
			renderHookWithStore( () => useSanitizeOverridableProps( MOCK_SECOND_COMPONENT_ID, 'instance-2' ), store );

			// Assert - each render calls twice (effect + return)
			expect( mockFilterValidOverridableProps ).toHaveBeenCalledTimes( 4 );

			// Act
			dispatch( slice.actions.resetSanitizedComponents() );

			renderHookWithStore( () => useSanitizeOverridableProps( MOCK_COMPONENT_ID, 'instance-1' ), store );
			renderHookWithStore( () => useSanitizeOverridableProps( MOCK_COMPONENT_ID, 'instance-1' ), store ); // second invocation: isSanitized, returns directly
			renderHookWithStore( () => useSanitizeOverridableProps( MOCK_SECOND_COMPONENT_ID, 'instance-2' ), store );
			renderHookWithStore( () => useSanitizeOverridableProps( MOCK_SECOND_COMPONENT_ID, 'instance-2' ), store ); // second invocation: isSanitized, returns directly

			// Assert - first render of each: 2 calls (effect + return), second render: no calls (isSanitized)
			expect( mockFilterValidOverridableProps ).toHaveBeenCalledTimes( 8 );
		} );
	} );

	describe( 'edge cases', () => {
		it( 'should return undefined when componentId is null', () => {
			// Act
			const { result } = renderHookWithStore( () => useSanitizeOverridableProps( null, 'instance-1' ), store );

			// Assert
			expect( result.current ).toBeUndefined();
			expect( mockFilterValidOverridableProps ).not.toHaveBeenCalled();
		} );

		it( 'should return undefined when component does not exist', () => {
			// Act
			const { result } = renderHookWithStore(
				() => useSanitizeOverridableProps( MOCK_COMPONENT_ID, 'instance-1' ),
				store
			);

			// Assert
			expect( result.current ).toBeUndefined();
			expect( mockFilterValidOverridableProps ).not.toHaveBeenCalled();
		} );

		it( 'should filter props when instanceElementId is undefined (component edit mode)', () => {
			// Arrange
			const mockOverridableProps = createMockOverridableProps();
			const mockComponent = createMockComponent( MOCK_COMPONENT_ID, mockOverridableProps );
			dispatch( slice.actions.load( [ mockComponent ] ) );
			mockFilterValidOverridableProps.mockReturnValue( mockOverridableProps );

			// Act
			const { result } = renderHookWithStore(
				() => useSanitizeOverridableProps( MOCK_COMPONENT_ID, undefined ),
				store
			);

			// Assert - returns filtered props without ID conversion
			expect( result.current ).toEqual( mockOverridableProps );
			expect( mockFilterValidOverridableProps ).toHaveBeenCalledWith( mockOverridableProps, undefined );
		} );
	} );
} );
