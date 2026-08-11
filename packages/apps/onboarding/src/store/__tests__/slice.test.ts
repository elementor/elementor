import { StepId } from '../../types';
import { markProInstalled, slice } from '../slice';

describe( 'markProInstalled', () => {
  it( 'replaces site_features with theme_selection for free onboarding config', () => {
    // Arrange
    const state = {
      ...slice.getInitialState(),
      steps: [ { id: StepId.SITE_FEATURES, label: 'Site features', type: 'multiple' as const } ],
    };

    // Act
    const nextState = slice.reducer( state, markProInstalled() );

    // Assert
    expect( nextState.steps.map( ( step ) => step.id ) ).toEqual( [ StepId.THEME_SELECTION ] );
    expect( nextState.currentStepId ).toBe( StepId.THEME_SELECTION );
    expect( nextState.currentStepIndex ).toBe( 0 );
    expect( nextState.hasProInstallScreenDismissed ).toBe( true );
  } );

  it( 'removes site_features without duplicating theme_selection', () => {
    // Arrange
    const state = {
      ...slice.getInitialState(),
      steps: [
        { id: StepId.THEME_SELECTION, label: 'Theme selection', type: 'single' as const },
        { id: StepId.SITE_FEATURES, label: 'Site features', type: 'multiple' as const },
      ],
    };

    // Act
    const nextState = slice.reducer( state, markProInstalled() );

    // Assert
    expect( nextState.steps.map( ( step ) => step.id ) ).toEqual( [ StepId.THEME_SELECTION ] );
  } );
} );
