import * as React from 'react';
import { createMockDocumentData, createMockPropType } from 'test-utils';
import { useBoundProp } from '@elementor/editor-controls';
import { getV1CurrentDocument } from '@elementor/editor-documents';
import { useElement } from '@elementor/editor-editing-panel';
import { type TransformablePropValue } from '@elementor/editor-props';
import { __createStore, __registerSlice } from '@elementor/store';
import { ThemeProvider } from '@elementor/ui';
import { generateUniqueId } from '@elementor/utils';
import { render, screen } from '@testing-library/react';

import { componentOverridablePropTypeUtil } from '../../../prop-types/component-overridable-prop-type';
import { selectOverridableProps, slice } from '../../../store/store';
import { COMPONENT_DOCUMENT_TYPE } from '../../consts';
import { OverridablePropIndicator } from '../overridable-prop-indicator';

jest.mock( '@elementor/editor-controls', () => ( {
	...jest.requireActual( '@elementor/editor-controls' ),
	useBoundProp: jest.fn(),
} ) );
jest.mock( '@elementor/editor-documents' );
jest.mock( '@elementor/editor-editing-panel', () => ( {
	...jest.requireActual( '@elementor/editor-editing-panel' ),
	useElement: jest.fn(),
} ) );
jest.mock( '../../../store/store', () => ( {
	...jest.requireActual( '../../../store/store' ),
	selectOverridableProps: jest.fn(),
} ) );

const MOCK_ELEMENT_ID = 'test-element-123';
const MOCK_COMPONENT_ID = 456;
const MOCK_WIDGET_TYPE = 'e-heading';

describe( 'OverridablePropIndicator', () => {
	beforeEach( () => {
		__registerSlice( slice );
		__createStore();

		jest.mocked( useElement ).mockReturnValue( {
			element: { id: MOCK_ELEMENT_ID, type: MOCK_WIDGET_TYPE },
			elementType: { key: MOCK_WIDGET_TYPE, propsSchema: {}, controls: [], title: 'Test Element' },
		} );

		jest.mocked( selectOverridableProps ).mockReturnValue( {
			props: {},
			groups: {
				items: {},
				order: [],
			},
		} );
	} );

	afterEach( () => {
		jest.resetAllMocks();
	} );

	it.each( [
		{
			should: 'not show indicator on fields when not editing a component',
			bind: 'title',
			isOverridable: false,
			isComponent: false,
			expect: {
				isShowingIndicator: false,
				isChecked: false,
			},
		},
		{
			should: 'be a plus icon if prop is not overridable',
			bind: 'title',
			isOverridable: false,
			isComponent: true,
			expect: {
				isShowingIndicator: true,
				isChecked: false,
			},
		},
		{
			should: 'be a check icon if prop is overridable',
			bind: 'title',
			isOverridable: true,
			isComponent: true,
			expect: {
				isShowingIndicator: true,
				isChecked: true,
			},
		},
		{
			should: 'not show indicator on fields bound to forbidden keys',
			bind: '_cssid',
			isOverridable: true,
			isComponent: true,
			expect: {
				isShowingIndicator: false,
				isChecked: false,
			},
		},
	] )( 'should $should', ( { bind, isOverridable, isComponent, expect: { isShowingIndicator, isChecked } } ) => {
		// Arrange
		const mockDocument = createMockDocumentData( {
			id: MOCK_COMPONENT_ID,
			type: isComponent ? COMPONENT_DOCUMENT_TYPE : 'wp-page',
		} );

		jest.mocked( getV1CurrentDocument ).mockReturnValue( mockDocument );
		jest.mocked( useBoundProp ).mockReturnValue(
			mockPropType(
				{
					bind,
					value: { $$type: 'string', value: 'Test' },
				},
				isOverridable
			)
		);

		// Act
		renderFieldWithIndicator();

		// Assert
		if ( ! isShowingIndicator ) {
			expect( screen.queryByRole( 'button' ) ).not.toBeInTheDocument();

			return;
		}

		const indicator = isChecked
			? screen.getByLabelText( 'Overridable property' )
			: screen.getByLabelText( 'Make prop overridable' );

		expect( indicator ).toBeInTheDocument();
	} );
} );

function mockPropType(
	{ bind, value }: { bind: string; value: TransformablePropValue< string, unknown > },
	isOverridableType: boolean
): ReturnType< typeof useBoundProp > {
	const params = {
		value,
		setValue: jest.fn(),
		restoreValue: jest.fn(),
		resetValue: jest.fn(),
		bind,
		propType: createMockPropType( { kind: 'plain' } ),
		path: [ bind ],
	};

	if ( ! isOverridableType ) {
		return params;
	}

	const overridablePropValue = componentOverridablePropTypeUtil.create( {
		override_key: generateUniqueId(),
		origin_value: value,
	} );

	return {
		...params,
		value: overridablePropValue,
	};
}

function renderFieldWithIndicator() {
	return render(
		<ThemeProvider>
			<OverridablePropIndicator />
		</ThemeProvider>
	);
}
