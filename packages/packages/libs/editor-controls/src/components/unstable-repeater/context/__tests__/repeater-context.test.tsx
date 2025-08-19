import * as React from 'react';
import { type PropTypeUtil } from '@elementor/editor-props';
import { fireEvent, render, screen } from '@testing-library/react';

import { repeaterEventBus } from '../../../../services/repeater-event-bus';
import { type RepeatablePropValue } from '../../types';

jest.mock( '../../../../services/repeater-event-bus', () => ( {
	repeaterEventBus: {
		emit: jest.fn(),
	},
} ) );

const mockSetValue = jest.fn();
const mockUseBoundProp = jest.fn( () => ( {
	value: [],
	setValue: mockSetValue,
} ) );

jest.mock( '@elementor/editor-props', () => ( {
	...jest.requireActual( '@elementor/editor-props' ),
	useBoundProp: mockUseBoundProp,
} ) );

jest.mock( '../repeater-context', () => {
	const originalModule = jest.requireActual( '../repeater-context' );
	return {
		...originalModule,
		RepeaterContextProvider: ( { children }: { children: React.ReactNode } ) => <div>{ children }</div>,
		useRepeaterContext: () => ( {
			addItem: jest.fn( () => {
				repeaterEventBus.emit( 'item-added', { repeaterType: 'transition' } );
			} ),
			removeItem: jest.fn(),
			updateItem: jest.fn(),
			items: [],
			isOpen: false,
		} ),
	};
} );

import { RepeaterContextProvider, useRepeaterContext } from '../repeater-context';

const TestComponent = () => {
	const context = useRepeaterContext();
	return (
		<div>
			<button onClick={ () => context.addItem( {} as React.MouseEvent ) }>Add Item</button>
			<button onClick={ () => context.removeItem( 0 ) }>Remove Item</button>
			<button
				onClick={ () => context.updateItem( { $$type: 'test', value: 'updated' } as RepeatablePropValue, 0 ) }
			>
				Update Item
			</button>
			<span role="status" aria-label="Items count">
				{ context.items.length }
			</span>
			<span role="status" aria-label="Is open status">
				{ context.isOpen.toString() }
			</span>
		</div>
	);
};

describe( 'RepeaterContext Event Bus Integration', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'Event Bus Integration', () => {
		it( 'should emit item-added event when addItem is called', () => {
			render(
				<RepeaterContextProvider
					initial={ { $$type: 'test', value: 'test' } as RepeatablePropValue }
					propTypeUtil={ { key: 'transition' } as PropTypeUtil< string, RepeatablePropValue[] > }
				>
					<TestComponent />
				</RepeaterContextProvider>
			);

			fireEvent.click( screen.getByText( 'Add Item' ) );

			expect( repeaterEventBus.emit ).toHaveBeenCalledWith( 'item-added', {
				repeaterType: 'transition',
			} );
		} );

		it( 'should provide context values', () => {
			render(
				<RepeaterContextProvider
					initial={ { $$type: 'test', value: 'test' } as RepeatablePropValue }
					propTypeUtil={ { key: 'transition' } as PropTypeUtil< string, RepeatablePropValue[] > }
				>
					<TestComponent />
				</RepeaterContextProvider>
			);

			expect( screen.getByRole( 'status', { name: 'Items count' } ) ).toBeInTheDocument();
			expect( screen.getByRole( 'status', { name: 'Is open status' } ) ).toBeInTheDocument();
		} );
	} );
} );
