import * as React from 'react';
import { createMockPropType } from 'test-utils';
import { type PopupState } from '@elementor/ui';
import { render, screen } from '@testing-library/react';

import { PropProvider } from '../../../bound-prop-context';
import { ControlActionsProvider } from '../../../control-actions/control-actions-context';
import { TransformSettingsControl } from '../transform-settings-control';

const CHILDREN_PERSPECTIVE_LABEL = 'Children perspective';
const TRANSFORM_LABEL = 'Transform';

describe( 'TransformSettingsControl', () => {
	const sizePropType = createMockPropType( {
		kind: 'object',
		shape: {
			unit: createMockPropType( { kind: 'plain' } ),
			size: createMockPropType( { kind: 'plain' } ),
		},
	} );

	const propType = createMockPropType( {
		kind: 'object',
		shape: {
			'transform-origin': createMockPropType( {
				kind: 'object',
				shape: {
					x: sizePropType,
					y: sizePropType,
					z: sizePropType,
				},
			} ),
			perspective: sizePropType,
			'perspective-origin': createMockPropType( {
				kind: 'object',
				shape: {
					x: sizePropType,
					y: sizePropType,
				},
			} ),
		},
	} );

	const mockPopupState = {
		isOpen: true,
		close: jest.fn(),
		open: jest.fn(),
		toggle: jest.fn(),
		setOpen: jest.fn(),
		onBlur: jest.fn(),
		onMouseLeave: jest.fn(),
		setAnchorEl: jest.fn(),
		setAnchorElUsed: false,
		anchorEl: undefined,
		anchorPosition: undefined,
		disableAutoFocus: false,
		disableRestoreFocus: false,
		variant: 'popover' as const,
		popupId: 'test-popup',
		_openEventType: null,
		_childPopupState: null,
		_setChildPopupState: jest.fn(),
	} as PopupState;

	const anchorRef = { current: document.createElement( 'div' ) };

	it( 'should render transform origin control', () => {
		// Arrange & Act
		render(
			<ControlActionsProvider items={ [] }>
				<PropProvider propType={ propType } value={ null } setValue={ jest.fn() }>
					<TransformSettingsControl
						popupState={ mockPopupState }
						anchorRef={ anchorRef }
						showChildrenPerspective={ false }
					/>
				</PropProvider>
			</ControlActionsProvider>
		);

		// Assert
		expect( screen.getByText( TRANSFORM_LABEL ) ).toBeInTheDocument();
	} );

	it( 'should show children perspective control when showChildrenPerspective is true', () => {
		// Arrange & Act
		render(
			<ControlActionsProvider items={ [] }>
				<PropProvider propType={ propType } value={ null } setValue={ jest.fn() }>
					<TransformSettingsControl
						popupState={ mockPopupState }
						anchorRef={ anchorRef }
						showChildrenPerspective={ true }
					/>
				</PropProvider>
			</ControlActionsProvider>
		);

		// Assert
		expect( screen.getByText( TRANSFORM_LABEL ) ).toBeInTheDocument();
		expect( screen.getByText( CHILDREN_PERSPECTIVE_LABEL ) ).toBeInTheDocument();
	} );

	it( 'should hide children perspective control when showChildrenPerspective is false', () => {
		// Arrange & Act
		render(
			<ControlActionsProvider items={ [] }>
				<PropProvider propType={ propType } value={ null } setValue={ jest.fn() }>
					<TransformSettingsControl
						popupState={ mockPopupState }
						anchorRef={ anchorRef }
						showChildrenPerspective={ false }
					/>
				</PropProvider>
			</ControlActionsProvider>
		);

		// Assert
		expect( screen.getByText( TRANSFORM_LABEL ) ).toBeInTheDocument();
		expect( screen.queryByText( CHILDREN_PERSPECTIVE_LABEL ) ).not.toBeInTheDocument();
	} );

	it( 'should not render divider before children perspective when showChildrenPerspective is false', () => {
		// Arrange & Act
		const { baseElement } = render(
			<ControlActionsProvider items={ [] }>
				<PropProvider propType={ propType } value={ null } setValue={ jest.fn() }>
					<TransformSettingsControl
						popupState={ mockPopupState }
						anchorRef={ anchorRef }
						showChildrenPerspective={ false }
					/>
				</PropProvider>
			</ControlActionsProvider>
		);

		// Assert
		// eslint-disable-next-line testing-library/no-node-access
		const dividers = baseElement.querySelectorAll( 'hr' );
		expect( dividers ).toHaveLength( 1 );
	} );

	it( 'should render divider before children perspective when showChildrenPerspective is true', () => {
		// Arrange & Act
		const { baseElement } = render(
			<ControlActionsProvider items={ [] }>
				<PropProvider propType={ propType } value={ null } setValue={ jest.fn() }>
					<TransformSettingsControl
						popupState={ mockPopupState }
						anchorRef={ anchorRef }
						showChildrenPerspective={ true }
					/>
				</PropProvider>
			</ControlActionsProvider>
		);

		// Assert
		// eslint-disable-next-line testing-library/no-node-access
		const dividers = baseElement.querySelectorAll( 'hr' );
		expect( dividers ).toHaveLength( 2 );
	} );
} );
