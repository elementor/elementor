import * as React from 'react';
import { createMockElementType, renderWithTheme } from 'test-utils';
import {
  getElementStateParams,
  getWidgetsCache,
  updateElementStateParams,
} from '@elementor/editor-elements';
import { fireEvent, screen } from '@testing-library/react';

import { ElementProvider } from '../../../contexts/element-context';
import { StateSection } from '../state-section';

jest.mock( '@elementor/editor-elements', () => ( {
  ...jest.requireActual( '@elementor/editor-elements' ),
  getElementStateParams: jest.fn(),
  updateElementStateParams: jest.fn(),
  getWidgetsCache: jest.fn(),
} ) );

const CONTAINER_ID = 'flexbox-1';
const CONTAINER_TYPE = 'e-flexbox';
const WIDGET_TYPE = 'e-heading';
const COUNT_PARAM = { key: 'count', label: 'count', type: 'number' as const, default: 0 };

const renderStateSection = ( type = CONTAINER_TYPE ) => {
  const element = { id: CONTAINER_ID, type };
  const elementType = createMockElementType( { key: type, title: type } );

  return renderWithTheme(
    <ElementProvider element={ element } elementType={ elementType } settings={ {} }>
      <StateSection />
    </ElementProvider>
  );
};

describe( '<StateSection />', () => {
  beforeEach( () => {
    jest.clearAllMocks();
    jest.mocked( getWidgetsCache ).mockReturnValue( {
      [ CONTAINER_TYPE ]: { elType: CONTAINER_TYPE },
      [ WIDGET_TYPE ]: { elType: 'widget' },
    } as never );
  } );

  it( 'should render the declared state params of a container', () => {
    // Arrange
    jest.mocked( getElementStateParams ).mockReturnValue( [ COUNT_PARAM ] );

    // Act
    renderStateSection();

    // Assert
    expect( getElementStateParams ).toHaveBeenCalledWith( CONTAINER_ID );
    expect( screen.getByRole( 'textbox', { name: 'State key' } ) ).toHaveValue( 'count' );
    expect( screen.getByRole( 'textbox', { name: 'State default' } ) ).toHaveValue( '0' );
  } );

  it( 'should add a new string param', () => {
    // Arrange
    jest.mocked( getElementStateParams ).mockReturnValue( [] );
    renderStateSection();

    // Act
    fireEvent.click( screen.getByRole( 'button', { name: 'Add state' } ) );

    // Assert
    expect( updateElementStateParams ).toHaveBeenCalledWith( {
      elementId: CONTAINER_ID,
      stateParams: [ { key: '', label: '', type: 'string', default: '' } ],
    } );
  } );

  it( 'should keep the label in sync with the key', () => {
    // Arrange
    jest.mocked( getElementStateParams ).mockReturnValue( [ COUNT_PARAM ] );
    renderStateSection();

    // Act
    fireEvent.change( screen.getByRole( 'textbox', { name: 'State key' } ), {
      target: { value: 'total' },
    } );

    // Assert
    expect( updateElementStateParams ).toHaveBeenLastCalledWith( {
      elementId: CONTAINER_ID,
      stateParams: [ { ...COUNT_PARAM, key: 'total', label: 'total' } ],
    } );
  } );

  it.each( [
    { input: '5', expected: 5 },
    { input: '{{state.start}}', expected: '{{state.start}}' },
  ] )( 'should store the number default $input as $expected', ( { input, expected } ) => {
    // Arrange
    jest.mocked( getElementStateParams ).mockReturnValue( [ COUNT_PARAM ] );
    renderStateSection();

    // Act
    fireEvent.change( screen.getByRole( 'textbox', { name: 'State default' } ), {
      target: { value: input },
    } );

    // Assert
    expect( updateElementStateParams ).toHaveBeenLastCalledWith( {
      elementId: CONTAINER_ID,
      stateParams: [ { ...COUNT_PARAM, default: expected } ],
    } );
  } );

  it( 'should remove a param', () => {
    // Arrange
    jest.mocked( getElementStateParams ).mockReturnValue( [ COUNT_PARAM ] );
    renderStateSection();

    // Act
    fireEvent.click( screen.getByRole( 'button', { name: 'Remove state' } ) );

    // Assert
    expect( updateElementStateParams ).toHaveBeenCalledWith( {
      elementId: CONTAINER_ID,
      stateParams: [],
    } );
  } );

  it( 'should not render for widgets', () => {
    // Arrange
    jest.mocked( getElementStateParams ).mockReturnValue( [ COUNT_PARAM ] );

    // Act
    renderStateSection( WIDGET_TYPE );

    // Assert
    expect( screen.queryByRole( 'button', { name: 'Add state' } ) ).not.toBeInTheDocument();
  } );
} );
