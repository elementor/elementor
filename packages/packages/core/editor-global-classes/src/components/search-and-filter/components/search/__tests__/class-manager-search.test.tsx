import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import { mockTrackGlobalClasses, mockTrackingModule } from '../../../../../__tests__/mocks';
import { useSearchAndFilters } from '../../../context';
import { ClassManagerSearch } from '../class-manager-search';

jest.mock( '../../../context' );
jest.mock( '../../../../../utils/tracking', () => mockTrackingModule );

describe( 'ClassManagerSearch', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		jest.mocked( useSearchAndFilters ).mockReturnValue( {
			search: {
				inputValue: '',
				debouncedValue: '',
				handleChange: jest.fn(),
				onClearSearch: jest.fn(),
			},
			filters: {
				filters: { empty: false, onThisPage: false, unused: false },
				setFilters: jest.fn(),
				onClearFilter: jest.fn(),
			},
		} );
	} );

	it( 'should track classManagerSearched event when search field is focused', () => {
		renderWithTheme( <ClassManagerSearch /> );

		const searchField = screen.getByRole( 'search' );
		const input = searchField.querySelector( 'input' ) || searchField;
		fireEvent.focus( input );

		expect( mockTrackGlobalClasses ).toHaveBeenCalledWith( {
			event: 'classManagerSearched',
		} );
	} );
} );
