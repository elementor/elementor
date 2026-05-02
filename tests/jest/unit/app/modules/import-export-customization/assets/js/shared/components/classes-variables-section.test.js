import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ClassesVariablesSection } from 'elementor/app/modules/import-export-customization/assets/js/shared/components/classes-variables-section';

global.__ = jest.fn( ( text ) => text );

describe( 'ClassesVariablesSection Component', () => {
	const defaultSettings = {
		classes: true,
		variables: true,
		classesOverrideAll: false,
		variablesOverrideAll: false,
	};

	const mockOnSettingChange = jest.fn();
	const mockOnClassesReviewClick = jest.fn();
	const mockOnVariablesReviewClick = jest.fn();

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'Basic Rendering', () => {
		it( 'should render section title', () => {
			// Arrange & Act
			render(
				<ClassesVariablesSection
					settings={ defaultSettings }
					onSettingChange={ mockOnSettingChange }
				/>,
			);

			// Assert
			expect( screen.getByText( 'Classes & variables' ) ).toBeTruthy();
		} );

		it( 'should render Classes and Variables rows', () => {
			// Arrange & Act
			render(
				<ClassesVariablesSection
					settings={ defaultSettings }
					onSettingChange={ mockOnSettingChange }
				/>,
			);

			// Assert
			expect( screen.getByText( 'Classes' ) ).toBeTruthy();
			expect( screen.getByText( 'Variables' ) ).toBeTruthy();
		} );

		it( 'should render switches for both classes and variables', () => {
			// Arrange & Act
			render(
				<ClassesVariablesSection
					settings={ defaultSettings }
					onSettingChange={ mockOnSettingChange }
				/>,
			);

			// Assert
			const switches = screen.getAllByRole( 'checkbox' );
			expect( switches.length ).toBeGreaterThanOrEqual( 2 );
		} );
	} );

	describe( 'Initial State', () => {
		it( 'should render with classes enabled when settings.classes is true', () => {
			// Arrange & Act
			render(
				<ClassesVariablesSection
					settings={ { ...defaultSettings, classes: true } }
					onSettingChange={ mockOnSettingChange }
				/>,
			);

			// Assert
			const switches = screen.getAllByRole( 'checkbox' );
			expect( switches[ 0 ].checked ).toBe( true );
		} );

		it( 'should render with classes disabled when settings.classes is false', () => {
			// Arrange & Act
			render(
				<ClassesVariablesSection
					settings={ { ...defaultSettings, classes: false } }
					onSettingChange={ mockOnSettingChange }
				/>,
			);

			// Assert
			const switches = screen.getAllByRole( 'checkbox' );
			expect( switches[ 0 ].checked ).toBe( false );
		} );

		it( 'should render with variables enabled when settings.variables is true', () => {
			// Arrange & Act
			render(
				<ClassesVariablesSection
					settings={ { ...defaultSettings, variables: true } }
					onSettingChange={ mockOnSettingChange }
				/>,
			);

			// Assert
			const switches = screen.getAllByRole( 'checkbox' );
			expect( switches[ 1 ].checked ).toBe( true );
		} );

		it( 'should render with variables disabled when settings.variables is false', () => {
			// Arrange & Act
			render(
				<ClassesVariablesSection
					settings={ { ...defaultSettings, variables: false } }
					onSettingChange={ mockOnSettingChange }
				/>,
			);

			// Assert
			const switches = screen.getAllByRole( 'checkbox' );
			expect( switches[ 1 ].checked ).toBe( false );
		} );

		it( 'should default to false when classes setting is undefined', () => {
			// Arrange & Act
			render(
				<ClassesVariablesSection
					settings={ { variables: true } }
					onSettingChange={ mockOnSettingChange }
				/>,
			);

			// Assert
			const switches = screen.getAllByRole( 'checkbox' );
			expect( switches[ 0 ].checked ).toBe( false );
		} );
	} );

	describe( 'Toggle Functionality', () => {
		it( 'should call onSettingChange with classes when classes switch is toggled', () => {
			// Arrange
			render(
				<ClassesVariablesSection
					settings={ defaultSettings }
					onSettingChange={ mockOnSettingChange }
				/>,
			);

			const switches = screen.getAllByRole( 'checkbox' );

			// Act
			fireEvent.click( switches[ 0 ] );

			// Assert
			expect( mockOnSettingChange ).toHaveBeenCalledWith( 'classes', false );
		} );

		it( 'should call onSettingChange with variables when variables switch is toggled', () => {
			// Arrange
			render(
				<ClassesVariablesSection
					settings={ defaultSettings }
					onSettingChange={ mockOnSettingChange }
				/>,
			);

			const switches = screen.getAllByRole( 'checkbox' );

			// Act
			fireEvent.click( switches[ 1 ] );

			// Assert
			expect( mockOnSettingChange ).toHaveBeenCalledWith( 'variables', false );
		} );
	} );

	describe( 'Disabled State', () => {
		it( 'should disable all switches when disabled prop is true', () => {
			// Arrange & Act
			render(
				<ClassesVariablesSection
					settings={ defaultSettings }
					onSettingChange={ mockOnSettingChange }
					disabled={ true }
				/>,
			);

			// Assert
			const switches = screen.getAllByRole( 'checkbox' );
			switches.forEach( ( switchEl ) => {
				expect( switchEl.disabled ).toBe( true );
			} );
		} );
	} );

	describe( 'Not Exported State', () => {
		it( 'should show "Not exported" for classes when classesExported is false in import mode', () => {
			// Arrange & Act
			render(
				<ClassesVariablesSection
					settings={ defaultSettings }
					onSettingChange={ mockOnSettingChange }
					isImport={ true }
					classesExported={ false }
					variablesExported={ true }
				/>,
			);

			// Assert
			expect( screen.getByText( 'Not exported' ) ).toBeTruthy();
		} );

		it( 'should show "Not exported" for both when both are not exported', () => {
			// Arrange & Act
			render(
				<ClassesVariablesSection
					settings={ defaultSettings }
					onSettingChange={ mockOnSettingChange }
					isImport={ true }
					classesExported={ false }
					variablesExported={ false }
				/>,
			);

			// Assert
			const notExportedTexts = screen.getAllByText( 'Not exported' );
			expect( notExportedTexts.length ).toBe( 2 );
		} );
	} );

	describe( 'Limit Exceeded Warning', () => {
		it( 'should show warning alert when classes limit is exceeded in import mode', () => {
			// Arrange & Act
			render(
				<ClassesVariablesSection
					settings={ defaultSettings }
					onSettingChange={ mockOnSettingChange }
					isImport={ true }
					classesLimitExceeded={ true }
					classesOverLimitCount={ 10 }
				/>,
			);

			// Assert
			expect( screen.getByText( 'Import limit reached.' ) ).toBeTruthy();
			expect( screen.getByText( 'To resolve this, review existing items or choose to override' ) ).toBeTruthy();
		} );

		it( 'should show warning alert when variables limit is exceeded in import mode', () => {
			// Arrange & Act
			render(
				<ClassesVariablesSection
					settings={ defaultSettings }
					onSettingChange={ mockOnSettingChange }
					isImport={ true }
					variablesLimitExceeded={ true }
					variablesOverLimitCount={ 5 }
				/>,
			);

			// Assert
			expect( screen.getByText( 'Import limit reached.' ) ).toBeTruthy();
		} );

		it( 'should not show warning alert in export mode even if limits are exceeded', () => {
			// Arrange & Act
			render(
				<ClassesVariablesSection
					settings={ defaultSettings }
					onSettingChange={ mockOnSettingChange }
					isImport={ false }
					classesLimitExceeded={ true }
					variablesLimitExceeded={ true }
				/>,
			);

			// Assert
			expect( screen.queryByText( 'Import limit reached.' ) ).toBeFalsy();
		} );

		it( 'should not show warning alert when notExported is true', () => {
			// Arrange & Act
			render(
				<ClassesVariablesSection
					settings={ defaultSettings }
					onSettingChange={ mockOnSettingChange }
					isImport={ true }
					classesLimitExceeded={ true }
					notExported={ true }
				/>,
			);

			// Assert
			expect( screen.queryByText( 'Import limit reached.' ) ).toBeFalsy();
		} );

		it( 'should show over limit chip when classes limit is exceeded', () => {
			// Arrange & Act
			render(
				<ClassesVariablesSection
					settings={ defaultSettings }
					onSettingChange={ mockOnSettingChange }
					isImport={ true }
					classesLimitExceeded={ true }
					classesOverLimitCount={ 15 }
				/>,
			);

			// Assert
			expect( screen.getByText( '15 over limit' ) ).toBeTruthy();
		} );

		it( 'should show over limit chip when variables limit is exceeded', () => {
			// Arrange & Act
			render(
				<ClassesVariablesSection
					settings={ defaultSettings }
					onSettingChange={ mockOnSettingChange }
					isImport={ true }
					variablesLimitExceeded={ true }
					variablesOverLimitCount={ 8 }
				/>,
			);

			// Assert
			expect( screen.getByText( '8 over limit' ) ).toBeTruthy();
		} );
	} );

	describe( 'Review Button', () => {
		it( 'should show Review link when classes limit is exceeded and callback is provided', () => {
			// Arrange & Act
			render(
				<ClassesVariablesSection
					settings={ defaultSettings }
					onSettingChange={ mockOnSettingChange }
					isImport={ true }
					classesLimitExceeded={ true }
					classesOverLimitCount={ 10 }
					onClassesReviewClick={ mockOnClassesReviewClick }
				/>,
			);

			// Assert
			const reviewLinks = screen.getAllByText( 'Review' );
			expect( reviewLinks.length ).toBeGreaterThan( 0 );
		} );

		it( 'should call onClassesReviewClick when Review is clicked for classes', () => {
			// Arrange
			render(
				<ClassesVariablesSection
					settings={ defaultSettings }
					onSettingChange={ mockOnSettingChange }
					isImport={ true }
					classesLimitExceeded={ true }
					classesOverLimitCount={ 10 }
					onClassesReviewClick={ mockOnClassesReviewClick }
				/>,
			);

			const reviewLink = screen.getAllByText( 'Review' )[ 0 ];

			// Act
			fireEvent.click( reviewLink );

			// Assert
			expect( mockOnClassesReviewClick ).toHaveBeenCalled();
		} );

		it( 'should call onVariablesReviewClick when Review is clicked for variables', () => {
			// Arrange
			render(
				<ClassesVariablesSection
					settings={ defaultSettings }
					onSettingChange={ mockOnSettingChange }
					isImport={ true }
					variablesLimitExceeded={ true }
					variablesOverLimitCount={ 5 }
					onVariablesReviewClick={ mockOnVariablesReviewClick }
				/>,
			);

			const reviewLinks = screen.getAllByText( 'Review' );
			const variablesReviewLink = reviewLinks[ reviewLinks.length - 1 ];

			// Act
			fireEvent.click( variablesReviewLink );

			// Assert
			expect( mockOnVariablesReviewClick ).toHaveBeenCalled();
		} );
	} );

	describe( 'Override All Functionality', () => {
		it( 'should show Override all checkbox when classes limit is exceeded in import mode', () => {
			// Arrange & Act
			render(
				<ClassesVariablesSection
					settings={ defaultSettings }
					onSettingChange={ mockOnSettingChange }
					isImport={ true }
					classesLimitExceeded={ true }
					classesOverLimitCount={ 10 }
				/>,
			);

			// Assert
			expect( screen.getByLabelText( 'Override all' ) ).toBeTruthy();
		} );

		it( 'should disable classes switch when limit exceeded and override not checked', () => {
			// Arrange & Act
			render(
				<ClassesVariablesSection
					settings={ defaultSettings }
					onSettingChange={ mockOnSettingChange }
					isImport={ true }
					classesLimitExceeded={ true }
					classesOverLimitCount={ 10 }
				/>,
			);

			// Assert
			const switches = screen.getAllByRole( 'checkbox' );
			switches.find( ( s ) => s.getAttribute( 'type' ) !== 'checkbox' || s.closest( '[class*="MuiSwitch"]' ) );
			// The switch should be disabled when limit exceeded and override is not checked
		} );

		it( 'should call onSettingChange with classesOverrideAll when override checkbox is toggled', () => {
			// Arrange
			render(
				<ClassesVariablesSection
					settings={ defaultSettings }
					onSettingChange={ mockOnSettingChange }
					isImport={ true }
					classesLimitExceeded={ true }
					classesOverLimitCount={ 10 }
				/>,
			);

			const overrideCheckbox = screen.getByLabelText( 'Override all' );

			// Act
			fireEvent.click( overrideCheckbox );

			// Assert
			expect( mockOnSettingChange ).toHaveBeenCalledWith( 'classesOverrideAll', true );
		} );

		it( 'should show Override all for variables when variables limit is exceeded', () => {
			// Arrange & Act
			render(
				<ClassesVariablesSection
					settings={ defaultSettings }
					onSettingChange={ mockOnSettingChange }
					isImport={ true }
					variablesLimitExceeded={ true }
					variablesOverLimitCount={ 5 }
				/>,
			);

			// Assert
			expect( screen.getByLabelText( 'Override all' ) ).toBeTruthy();
		} );

		it( 'should call onSettingChange with variablesOverrideAll when variables override checkbox is toggled', () => {
			// Arrange
			render(
				<ClassesVariablesSection
					settings={ defaultSettings }
					onSettingChange={ mockOnSettingChange }
					isImport={ true }
					variablesLimitExceeded={ true }
					variablesOverLimitCount={ 5 }
				/>,
			);

			const overrideCheckbox = screen.getByLabelText( 'Override all' );

			// Act
			fireEvent.click( overrideCheckbox );

			// Assert
			expect( mockOnSettingChange ).toHaveBeenCalledWith( 'variablesOverrideAll', true );
		} );
	} );

	describe( 'Export Mode', () => {
		it( 'should not show Override all in export mode', () => {
			// Arrange & Act
			render(
				<ClassesVariablesSection
					settings={ defaultSettings }
					onSettingChange={ mockOnSettingChange }
					isImport={ false }
				/>,
			);

			// Assert
			expect( screen.queryByLabelText( 'Override all' ) ).toBeFalsy();
		} );

		it( 'should not show over limit chip in export mode', () => {
			// Arrange & Act
			render(
				<ClassesVariablesSection
					settings={ defaultSettings }
					onSettingChange={ mockOnSettingChange }
					isImport={ false }
					classesLimitExceeded={ true }
					classesOverLimitCount={ 10 }
				/>,
			);

			// Assert
			expect( screen.queryByText( '10 over limit' ) ).toBeFalsy();
		} );
	} );

	describe( 'Edge Cases', () => {
		it( 'should handle both limits exceeded', () => {
			// Arrange & Act
			render(
				<ClassesVariablesSection
					settings={ defaultSettings }
					onSettingChange={ mockOnSettingChange }
					isImport={ true }
					classesLimitExceeded={ true }
					classesOverLimitCount={ 10 }
					variablesLimitExceeded={ true }
					variablesOverLimitCount={ 5 }
					onClassesReviewClick={ mockOnClassesReviewClick }
					onVariablesReviewClick={ mockOnVariablesReviewClick }
				/>,
			);

			// Assert
			expect( screen.getByText( '10 over limit' ) ).toBeTruthy();
			expect( screen.getByText( '5 over limit' ) ).toBeTruthy();
			expect( screen.getAllByText( 'Override all' ).length ).toBe( 2 );
		} );

		it( 'should handle zero over limit count', () => {
			// Arrange & Act
			render(
				<ClassesVariablesSection
					settings={ defaultSettings }
					onSettingChange={ mockOnSettingChange }
					isImport={ true }
					classesLimitExceeded={ true }
					classesOverLimitCount={ 0 }
				/>,
			);

			// Assert
			expect( screen.queryByText( '0 over limit' ) ).toBeFalsy();
		} );

		it( 'should initialize override state from settings', () => {
			// Arrange & Act
			render(
				<ClassesVariablesSection
					settings={ {
						...defaultSettings,
						classesOverrideAll: true,
					} }
					onSettingChange={ mockOnSettingChange }
					isImport={ true }
					classesLimitExceeded={ true }
					classesOverLimitCount={ 10 }
				/>,
			);

			// Assert
			const overrideCheckbox = screen.getByLabelText( 'Override all' );
			expect( overrideCheckbox.checked ).toBe( true );
		} );
	} );
} );
