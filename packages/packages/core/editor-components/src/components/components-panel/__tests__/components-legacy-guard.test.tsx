import * as React from 'react';
import { useOnSwitchToLegacyElementsPanel } from '@elementor/editor-elements-panel';
import { render } from '@testing-library/react';

import { ComponentsLegacyGuard } from '../components-legacy-guard';
import { usePanelActions, usePanelStatus } from '../panel';

jest.mock( '@elementor/editor-elements-panel', () => ( {
	useOnSwitchToLegacyElementsPanel: jest.fn(),
} ) );

jest.mock( '../panel', () => ( {
	usePanelStatus: jest.fn(),
	usePanelActions: jest.fn(),
} ) );

describe( 'ComponentsLegacyGuard', () => {
	const close = jest.fn();

	const fireSwitch = () => {
		const callback = jest.mocked( useOnSwitchToLegacyElementsPanel ).mock.calls.at( -1 )?.[ 0 ];
		callback?.();
	};

	beforeEach( () => {
		jest.mocked( usePanelActions ).mockReturnValue( { open: jest.fn(), close } as never );
	} );

	it( 'should close the panel on switch to Legacy when open', () => {
		jest.mocked( usePanelStatus ).mockReturnValue( { isOpen: true, isBlocked: false } as never );
		render( <ComponentsLegacyGuard /> );

		fireSwitch();

		expect( close ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should do nothing on switch to Legacy when closed', () => {
		jest.mocked( usePanelStatus ).mockReturnValue( { isOpen: false, isBlocked: false } as never );
		render( <ComponentsLegacyGuard /> );

		fireSwitch();

		expect( close ).not.toHaveBeenCalled();
	} );
} );
