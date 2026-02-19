import * as React from 'react';
import { getContainer, replaceElement, useSelectedElement } from '@elementor/editor-elements';
import { renderWithTheme } from '@elementor/test-utils';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { InstanceEditingPanel } from '../components/instance-editing-panel/instance-editing-panel';
import { useComponentInstanceSettings } from '../hooks/use-component-instance-settings';
import { useComponentsPermissions } from '../hooks/use-components-permissions';
import { useSanitizeOverridableProps } from '../hooks/use-sanitize-overridable-props';
import { componentInstancePropTypeUtil } from '../prop-types/component-instance-prop-type';
import { useComponent } from '../store/store';
import { getComponentDocumentData } from '../utils/component-document-data';
import { trackComponentEvent } from '../utils/tracking';

jest.mock( '@elementor/editor-elements' );
jest.mock( '../hooks/use-component-instance-settings' );
jest.mock( '../hooks/use-components-permissions' );
jest.mock( '../hooks/use-sanitize-overridable-props' );
jest.mock( '../store/store' );
jest.mock( '../utils/component-document-data' );
jest.mock( '../utils/tracking' );

const mockUseComponentInstanceSettings = useComponentInstanceSettings as jest.MockedFunction<
	typeof useComponentInstanceSettings
>;
const mockUseComponentsPermissions = useComponentsPermissions as jest.MockedFunction< typeof useComponentsPermissions >;
const mockUseSanitizeOverridableProps = useSanitizeOverridableProps as jest.MockedFunction<
	typeof useSanitizeOverridableProps
>;
const mockUseComponent = useComponent as jest.MockedFunction< typeof useComponent >;
const mockUseSelectedElement = useSelectedElement as jest.MockedFunction< typeof useSelectedElement >;
const mockGetContainer = getContainer as jest.MockedFunction< typeof getContainer >;
const mockReplaceElement = replaceElement as jest.MockedFunction< typeof replaceElement >;
const mockGetComponentDocumentData = getComponentDocumentData as jest.MockedFunction< typeof getComponentDocumentData >;
const mockTrackComponentEvent = trackComponentEvent as jest.MockedFunction< typeof trackComponentEvent >;

describe( 'Detach Instance Integration', () => {
	beforeEach( () => {
		jest.clearAllMocks();

		mockUseComponentsPermissions.mockReturnValue( { canEdit: true, canDelete: true } as any );
		mockUseSelectedElement.mockReturnValue( { element: { id: 'instance-123' } } as any );
	} );

	it( 'should show detach button when user has edit permissions', () => {
		mockUseComponentInstanceSettings.mockReturnValue( {
			component_id: { value: 456 },
			overrides: { value: [] },
		} as any );

		mockUseComponent.mockReturnValue( { id: 456, name: 'My Component' } as any );
		mockUseSanitizeOverridableProps.mockReturnValue( {
			props: {},
			groups: { order: [], items: {} },
		} as any );

		renderWithTheme( <InstanceEditingPanel /> );

		expect( screen.getByLabelText( 'Detach from Component' ) ).toBeInTheDocument();
	} );

	it( 'should not show detach button when user has no edit permissions', () => {
		mockUseComponentsPermissions.mockReturnValue( { canEdit: false, canDelete: false } as any );
		mockUseComponentInstanceSettings.mockReturnValue( {
			component_id: { value: 456 },
			overrides: { value: [] },
		} as any );

		mockUseComponent.mockReturnValue( { id: 456, name: 'My Component' } as any );
		mockUseSanitizeOverridableProps.mockReturnValue( {
			props: {},
			groups: { order: [], items: {} },
		} as any );

		renderWithTheme( <InstanceEditingPanel /> );

		expect( screen.queryByLabelText( 'Detach from Component' ) ).not.toBeInTheDocument();
	} );

	it( 'should show confirmation dialog when detach button is clicked', async () => {
		mockUseComponentInstanceSettings.mockReturnValue( {
			component_id: { value: 456 },
			overrides: { value: [] },
		} as any );

		mockUseComponent.mockReturnValue( { id: 456, name: 'My Component' } as any );
		mockUseSanitizeOverridableProps.mockReturnValue( {
			props: {},
			groups: { order: [], items: {} },
		} as any );

		renderWithTheme( <InstanceEditingPanel /> );

		const detachButton = screen.getByLabelText( 'Detach from Component' );
		fireEvent.click( detachButton );

		await waitFor( () => {
			expect( screen.getByText( 'Detach from Component?' ) ).toBeInTheDocument();
		} );

		expect(
			screen.getByText( /Detaching this instance will break its link to the Component/i )
		).toBeInTheDocument();
	} );

	it( 'should close dialog when cancel is clicked', async () => {
		mockUseComponentInstanceSettings.mockReturnValue( {
			component_id: { value: 456 },
			overrides: { value: [] },
		} as any );

		mockUseComponent.mockReturnValue( { id: 456, name: 'My Component' } as any );
		mockUseSanitizeOverridableProps.mockReturnValue( {
			props: {},
			groups: { order: [], items: {} },
		} as any );

		renderWithTheme( <InstanceEditingPanel /> );

		const detachButton = screen.getByLabelText( 'Detach from Component' );
		fireEvent.click( detachButton );

		await waitFor( () => {
			expect( screen.getByText( 'Detach from Component?' ) ).toBeInTheDocument();
		} );

		const cancelButton = screen.getByRole( 'button', { name: /cancel/i } );
		fireEvent.click( cancelButton );

		await waitFor( () => {
			expect( screen.queryByText( 'Detach from Component?' ) ).not.toBeInTheDocument();
		} );
	} );

	it( 'should detach instance when confirm is clicked', async () => {
		const mockContainer = {
			id: 'instance-123',
			model: {
				toJSON: () => ( {
					id: 'instance-123',
					elType: 'widget',
					widgetType: 'e-component',
					settings: {
						component_instance: componentInstancePropTypeUtil.create( {
							component_id: {
								$$type: 'number',
								value: 456,
							},
							overrides: [],
						} ),
					},
				} ),
			},
		};

		const mockComponentData = {
			elements: [
				{
					id: 'element-1',
					elType: 'widget',
					widgetType: 'heading',
					settings: {
						title: 'Title',
					},
				},
			],
		};

		mockGetContainer.mockReturnValue( mockContainer as any );
		mockGetComponentDocumentData.mockResolvedValue( mockComponentData as any );

		mockUseComponentInstanceSettings.mockReturnValue( {
			component_id: { value: 456 },
			overrides: { value: [] },
		} as any );

		mockUseComponent.mockReturnValue( { id: 456, name: 'My Component' } as any );
		mockUseSanitizeOverridableProps.mockReturnValue( {
			props: {},
			groups: { order: [], items: {} },
		} as any );

		renderWithTheme( <InstanceEditingPanel /> );

		const detachButton = screen.getByLabelText( 'Detach from Component' );
		fireEvent.click( detachButton );

		await waitFor( () => {
			expect( screen.getByText( 'Detach from Component?' ) ).toBeInTheDocument();
		} );

		const confirmButton = screen.getByRole( 'button', { name: /confirm/i } );
		fireEvent.click( confirmButton );

		await waitFor( () => {
			expect( mockReplaceElement ).toHaveBeenCalled();
		} );

		expect( mockTrackComponentEvent ).toHaveBeenCalledWith( {
			action: 'detached',
			source: 'user',
			component_id: 456,
			instance_id: 'instance-123',
		} );
	} );
} );
