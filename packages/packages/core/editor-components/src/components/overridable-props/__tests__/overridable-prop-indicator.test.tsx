import * as React from 'react';
import { createMockDocumentData, createMockPropType } from 'test-utils';
import { useBoundProp } from '@elementor/editor-controls';
import { getV1CurrentDocument } from '@elementor/editor-documents';
import { useElement } from '@elementor/editor-editing-panel';
import { type PropValue, stringPropTypeUtil } from '@elementor/editor-props';
import { __createStore, __registerSlice } from '@elementor/store';
import { ThemeProvider } from '@elementor/ui';
import { generateUniqueId } from '@elementor/utils';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { componentOverridablePropTypeUtil } from '../../../prop-types/component-overridable-prop-type';
import { setOverridableProp } from '../../../store/set-overridable-prop';
import { selectOverridableProps, slice } from '../../../store/store';
import { COMPONENT_DOCUMENT_TYPE } from '../../consts';
import { FORBIDDEN_KEYS, OverridablePropIndicator } from '../overridable-prop-indicator';

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
jest.mock( '../../../store/set-overridable-prop', () => ( {
	...jest.requireActual( '../../../store/set-overridable-prop' ),
	setOverridableProp: jest.fn(),
} ) );

const MOCK_ELEMENT_ID = 'test-element-123';
const MOCK_COMPONENT_ID = 456;
const MOCK_WIDGET_TYPE = 'e-heading';
const MOCK_OVERRIDABLE_KEY = 'mock-overridable-key';

describe( 'OverridablePropIndicator', () => {
	beforeEach( () => {
		__registerSlice( slice );
		__createStore();

		jest.mocked( useElement ).mockReturnValue( {
			element: { id: MOCK_ELEMENT_ID, type: MOCK_WIDGET_TYPE },
			elementType: { key: MOCK_WIDGET_TYPE, propsSchema: {}, controls: [], title: 'Test Element' },
		} );
	} );

	afterEach( () => {
		jest.resetAllMocks();
	} );

	it.each( [
		{
			should: 'not show indicator on fields when not editing a component',
			bind: 'title',
			currentValue: componentOverridablePropTypeUtil.create( {
				override_key: generateUniqueId(),
				default_value: { $$type: 'string', value: 'Test' },
			} ),
			overridableData: {
				label: 'Test',
				groupId: 'default',
			},
			isComponent: false,
		},
		{
			should: 'be a plus icon if prop is not overridable',
			bind: 'title',
			currentValue: stringPropTypeUtil.create( 'Test' ),
			overridableData: null,
			expectedLabel: '',
			expectedGroupId: null,
			isComponent: true,
		},
		{
			should: 'be a check icon if prop is overridable',
			bind: 'title',
			currentValue: componentOverridablePropTypeUtil.create( {
				override_key: generateUniqueId(),
				default_value: { $$type: 'string', value: 'Test' },
			} ),
			overridableData: {
				label: 'Test Label',
				groupId: 'default',
			},
			expectedLabel: 'Test Label',
			expectedGroupId: 'default',
			isComponent: true,
		},
		{
			should: 'not show indicator on fields bound to forbidden keys',
			bind: '_cssid',
			currentValue: componentOverridablePropTypeUtil.create( {
				override_key: generateUniqueId(),
				default_value: { $$type: 'string', value: 'Test' },
			} ),
			overridableData: {
				label: 'Test',
				groupId: 'default',
			},
			isComponent: true,
		},
	] )(
		'should $should',
		async ( {
			bind,
			currentValue = null,
			overridableData = null,
			expectedLabel,
			expectedGroupId,
			isComponent,
		} ) => {
			// Arrange
			const mockDocument = createMockDocumentData( {
				id: MOCK_COMPONENT_ID,
				type: isComponent ? COMPONENT_DOCUMENT_TYPE : 'wp-page',
			} );
			const boundProp = mockBoundProp( {
				bind,
				value: currentValue,
			} );
			const isOverridable = componentOverridablePropTypeUtil.isValid( currentValue );

			jest.mocked( getV1CurrentDocument ).mockReturnValue( mockDocument );
			jest.mocked( useBoundProp ).mockReturnValue( boundProp );
			jest.mocked( selectOverridableProps ).mockReturnValue(
				overridableData
					? {
							props: {
								[ MOCK_OVERRIDABLE_KEY ]: {
									'override-key': MOCK_OVERRIDABLE_KEY,
									elementId: MOCK_ELEMENT_ID,
									propKey: bind,
									widgetType: MOCK_WIDGET_TYPE,
									defaultValue: currentValue,
									...overridableData,
								},
							},
							groups: {
								items: {
									default: {
										id: 'default',
										label: 'Default',
										props: [ MOCK_OVERRIDABLE_KEY ],
									},
								},
								order: [ 'default' ],
							},
					  }
					: {
							props: {},
							groups: {
								items: {},
								order: [],
							},
					  }
			);

			// Act
			renderFieldWithIndicator();

			// Assert
			if ( ! isComponent ) {
				expect( screen.queryByRole( 'button' ) ).not.toBeInTheDocument();

				return;
			}

			if ( FORBIDDEN_KEYS.includes( bind ) ) {
				expect( screen.queryByRole( 'button' ) ).not.toBeInTheDocument();

				return;
			}

			const indicator = screen.getByLabelText( isOverridable ? 'Overridable property' : 'Make prop overridable' );
			expect( indicator ).toBeInTheDocument();

			// Act
			fireEvent.click( indicator );

			// Assert
			expect( screen.getByText( 'Create new property' ) ).toBeInTheDocument();
			const nameInput = screen.getByPlaceholderText( 'Enter value' );
			expect( nameInput ).toHaveValue( expectedLabel );

			// Act
			const newLabel = 'Updated Label';
			fireEvent.change( nameInput, { target: { value: newLabel } } );

			await waitFor( () => {
				expect( nameInput ).toHaveValue( newLabel );
			} );

			const createButton = screen.getByRole( 'button', { name: 'Create' } );
			fireEvent.click( createButton );

			// Assert
			await waitFor( () => {
				expect( setOverridableProp ).toHaveBeenCalledWith(
					MOCK_COMPONENT_ID,
					MOCK_ELEMENT_ID,
					newLabel,
					expectedGroupId,
					bind,
					MOCK_WIDGET_TYPE,
					currentValue
				);
			} );
		}
	);
} );

function mockBoundProp( { bind, value }: { bind: string; value: PropValue } ): ReturnType< typeof useBoundProp > {
	const params = {
		value,
		setValue: jest.fn(),
		restoreValue: jest.fn(),
		resetValue: jest.fn(),
		bind,
		propType: createMockPropType( { kind: 'plain' } ),
		path: [ bind ],
	};

	return params;
}

function renderFieldWithIndicator() {
	return render(
		<ThemeProvider>
			<OverridablePropIndicator />
		</ThemeProvider>
	);
}
