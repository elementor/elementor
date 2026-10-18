import * as React from 'react';
import { createMockElementType, renderWithTheme } from 'test-utils';
import { getElementState, updateElementState } from '@elementor/editor-elements';
import { isExperimentActive } from '@elementor/editor-v1-adapters';
import { fireEvent, screen } from '@testing-library/react';

import { ElementProvider } from '../../../contexts/element-context';
import { ComponentStateSection } from '../component-state-section';

jest.mock( '@elementor/editor-elements', () => ( {
  ...jest.requireActual( '@elementor/editor-elements' ),
  getElementState: jest.fn(),
  updateElementState: jest.fn(),
} ) );

jest.mock( '@elementor/editor-v1-adapters', () => ( {
  ...jest.requireActual( '@elementor/editor-v1-adapters' ),
  isExperimentActive: jest.fn(),
} ) );

const INSTANCE_ID = 'instance-1';
const COMPONENT_ID = 123;
const COMPONENT_PARAMS = [
  { key: 'label', label: 'Label', type: 'string', default: 'Count' },
  { key: 'start', label: 'Start', type: 'number', default: 0 },
];

const renderComponentStateSection = () =>
  renderWithTheme(
    <ElementProvider
      element={ { id: INSTANCE_ID, type: 'e-component' } }
      elementType={ createMockElementType( { key: 'e-component', title: 'Component' } ) }
      settings={ {} }
    >
      <ComponentStateSection componentId={ COMPONENT_ID } elementId={ INSTANCE_ID } />
    </ElementProvider>
  );

describe( '<ComponentStateSection />', () => {
  beforeEach( () => {
    jest.clearAllMocks();
    jest.mocked( isExperimentActive ).mockReturnValue( true );
    jest.mocked( getElementState ).mockReturnValue( {} );
    window.elementor = {
      ...window.elementor,
      config: { dataFlow: { componentParams: { [ COMPONENT_ID ]: COMPONENT_PARAMS } } },
    } as never;
  } );

  it( 'should render a field per component param with the default as placeholder', () => {
    // Arrange
    jest.mocked( getElementState ).mockReturnValue( { label: 'Likes' } );

    // Act
    renderComponentStateSection();

    // Assert
    expect( screen.getByRole( 'textbox', { name: 'Label' } ) ).toHaveValue( 'Likes' );
    expect( screen.getByRole( 'textbox', { name: 'Start' } ) ).toHaveValue( '' );
    expect( screen.getByRole( 'textbox', { name: 'Start' } ) ).toHaveAttribute(
      'placeholder',
      '0'
    );
  } );

  it( 'should store a typed value for the instance', () => {
    // Arrange
    renderComponentStateSection();

    // Act
    fireEvent.change( screen.getByRole( 'textbox', { name: 'Start' } ), {
      target: { value: '10' },
    } );

    // Assert
    expect( updateElementState ).toHaveBeenLastCalledWith( {
      elementId: INSTANCE_ID,
      state: { start: 10 },
    } );
  } );

  it( 'should fall back to the default when the value is cleared', () => {
    // Arrange
    jest.mocked( getElementState ).mockReturnValue( { label: 'Likes', start: 10 } );
    renderComponentStateSection();

    // Act
    fireEvent.change( screen.getByRole( 'textbox', { name: 'Label' } ), { target: { value: '' } } );

    // Assert
    expect( updateElementState ).toHaveBeenLastCalledWith( {
      elementId: INSTANCE_ID,
      state: { start: 10 },
    } );
  } );

  it( 'should not render when the data flow experiment is off', () => {
    // Arrange
    jest.mocked( isExperimentActive ).mockReturnValue( false );

    // Act
    renderComponentStateSection();

    // Assert
    expect( screen.queryByRole( 'textbox', { name: 'Label' } ) ).not.toBeInTheDocument();
  } );
} );
