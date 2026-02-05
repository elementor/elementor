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
		it( 'should run filtering logic only once per component', () => {
			// Arrange
			const mockOverridableProps = createMockOverridableProps();
			const mockComponent1 = createMockComponent( MOCK_COMPONENT_ID, mockOverridableProps );
			const mockComponent2 = createMockComponent( MOCK_SECOND_COMPONENT_ID, mockOverridableProps );
			dispatch( slice.actions.load( [ mockComponent1, mockComponent2 ] ) );
			mockFilterValidOverridableProps.mockReturnValue( mockOverridableProps );

			// Act
			renderHookWithStore( () => useSanitizeOverridableProps( MOCK_COMPONENT_ID ), store );

			// Assert
			expect( mockFilterValidOverridableProps ).toHaveBeenCalledTimes( 1 );

			// Act
			renderHookWithStore( () => useSanitizeOverridableProps( MOCK_SECOND_COMPONENT_ID ), store );

			// Assert
			expect( mockFilterValidOverridableProps ).toHaveBeenCalledTimes( 2 );

			// Act
			renderHookWithStore( () => useSanitizeOverridableProps( MOCK_COMPONENT_ID ), store );
			renderHookWithStore( () => useSanitizeOverridableProps( MOCK_SECOND_COMPONENT_ID ), store );

			// Assert
			expect( mockFilterValidOverridableProps ).toHaveBeenCalledTimes( 2 );
		} );

		it( 'should re-run filtering logic if sanitized components are reset', () => {
			// Arrange
			const mockOverridableProps = createMockOverridableProps();
			const mockComponent1 = createMockComponent( MOCK_COMPONENT_ID, mockOverridableProps );
			const mockComponent2 = createMockComponent( MOCK_SECOND_COMPONENT_ID, mockOverridableProps );
			dispatch( slice.actions.load( [ mockComponent1, mockComponent2 ] ) );
			mockFilterValidOverridableProps.mockReturnValue( mockOverridableProps );

			// Act
			renderHookWithStore( () => useSanitizeOverridableProps( MOCK_COMPONENT_ID ), store );
			renderHookWithStore( () => useSanitizeOverridableProps( MOCK_SECOND_COMPONENT_ID ), store );

			// Assert
			expect( mockFilterValidOverridableProps ).toHaveBeenCalledTimes( 2 );

			// Act
			dispatch( slice.actions.resetSanitizedComponents() );

			renderHookWithStore( () => useSanitizeOverridableProps( MOCK_COMPONENT_ID ), store );
			renderHookWithStore( () => useSanitizeOverridableProps( MOCK_COMPONENT_ID ), store ); // second invocation should be skipped
			renderHookWithStore( () => useSanitizeOverridableProps( MOCK_SECOND_COMPONENT_ID ), store );
			renderHookWithStore( () => useSanitizeOverridableProps( MOCK_SECOND_COMPONENT_ID ), store ); // second invocation should be skipped

			// Assert
			expect( mockFilterValidOverridableProps ).toHaveBeenCalledTimes( 4 );
		} );
	} );

	describe( 'edge cases', () => {
		it( 'should return undefined when componentId is null', () => {
			// Act
			const { result } = renderHookWithStore( () => useSanitizeOverridableProps( null ), store );

			// Assert
			expect( result.current ).toBeUndefined();
			expect( mockFilterValidOverridableProps ).not.toHaveBeenCalled();
		} );

		it( 'should return undefined when component does not exist', () => {
			// Act
			const { result } = renderHookWithStore( () => useSanitizeOverridableProps( MOCK_COMPONENT_ID ), store );

			// Assert
			expect( result.current ).toBeUndefined();
			expect( mockFilterValidOverridableProps ).not.toHaveBeenCalled();
		} );
	} );
} );
