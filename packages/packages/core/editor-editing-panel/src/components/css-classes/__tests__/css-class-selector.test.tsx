import * as React from 'react';
import { act } from 'react';
import {
	createMockElementType,
	createMockStyleDefinition,
	createMockStyleDefinitionWithVariants,
	createMockStylesProvider,
	mockHistoryManager,
	renderWithTheme,
} from 'test-utils';
import {
	getElementLabel,
	getElementSetting,
	updateElementSettings,
	useElementSetting,
} from '@elementor/editor-elements';
import { type StyleDefinitionState } from '@elementor/editor-styles';
import {
	ELEMENTS_STYLES_PROVIDER_KEY_PREFIX,
	stylesRepository,
	useGetStylesRepositoryCreateAction,
	useProviders,
	useUserStylesCapability,
	validateStyleLabel,
} from '@elementor/editor-styles-repository';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { __ } from '@wordpress/i18n';

import { ClassesPropProvider } from '../../../contexts/classes-prop-context';
import { ElementProvider } from '../../../contexts/element-context';
import { StyleProvider } from '../../../contexts/style-context';
import { CssClassSelector } from '../css-class-selector';

jest.mock( '@elementor/editor-styles-repository', () => {
	const mock = jest.createMockFromModule( '@elementor/editor-styles-repository' ) as object;
	const actual = jest.requireActual( '@elementor/editor-styles-repository' );

	return {
		...mock,
		createStylesProvider: actual.createStylesProvider,
		isElementsStylesProvider: actual.isElementsStylesProvider,
	};
} );

jest.mock( '@elementor/editor-elements' );
jest.mock( '@elementor/editor-documents', () => ( {
	setDocumentModifiedStatus: jest.fn(),
} ) );

// MUI use the useId hook behind the scenes, and it breaks the tests.
let mockId = 0;
jest.mock( 'react', () => ( {
	...jest.requireActual( 'react' ),
	useId: () => `mock-id-${ mockId++ }`,
} ) );

const providerLocalMockStyle = createMockStyleDefinitionWithVariants( {
	id: 'local',
	label: 'Local',
	variants: [
		{
			meta: {
				breakpoint: 'mobile',
				state: null,
			},
			props: {
				'text-align': 'left',
			},
		},
		{
			meta: {
				breakpoint: 'mobile',
				state: 'hover',
			},
			props: {
				'text-align': 'right',
			},
		},
	],
} );

const localProvider = createMockStylesProvider(
	{
		key: `${ ELEMENTS_STYLES_PROVIDER_KEY_PREFIX }1`,
		actions: {
			delete: undefined,
			create: undefined,
			update: undefined,
		},
	},
	[ providerLocalMockStyle ]
);

const provider1MockStyleA = createMockStyleDefinition( { id: 'provider-1-a', label: 'Provider-1-a' } );
const provider1MockStyleB = createMockStyleDefinition( { id: 'provider-1-b', label: 'Provider-1-b' } );

const provider1 = createMockStylesProvider(
	{
		key: 'provider-1',
		labels: { plural: 'Provider 1', singular: 'Provider 1 Class' },
	},
	[ provider1MockStyleA, provider1MockStyleB ]
);

const provider2MockStyleA = createMockStyleDefinition( { id: 'provider-2-a', label: 'Provider-2-a' } );

const provider2 = createMockStylesProvider(
	{
		key: 'provider-2',
		labels: { plural: 'Provider 2', singular: 'Provider 2 Class' },
	},
	[ provider2MockStyleA ]
);

describe( '<CssClassSelector />', () => {
	const historyMock = mockHistoryManager();

	beforeEach( () => {
		historyMock.beforeEach();

		jest.mocked( stylesRepository.all ).mockReturnValue( [
			providerLocalMockStyle,
			provider1MockStyleA,
			provider1MockStyleB,
			provider2MockStyleA,
		] );

		jest.mocked( useUserStylesCapability ).mockReturnValue( {
			userCan: () => ( {
				update: true,
				updateProps: true,
				create: true,
				delete: true,
			} ),
		} );

		jest.mocked( stylesRepository.getProviders ).mockReturnValue( [ localProvider, provider1, provider2 ] );

		jest.mocked( validateStyleLabel ).mockReturnValue( { isValid: true, errorMessage: null } );

		jest.mocked( useProviders ).mockReturnValue( [ localProvider, provider1, provider2 ] );

		jest.mocked( useGetStylesRepositoryCreateAction ).mockReturnValue( [ provider1, jest.fn() ] );

		jest.mocked( useElementSetting ).mockReturnValue( { value: [ 'local', 'provider-1-b', 'provider-1-a' ] } );
	} );

	afterEach( () => {
		historyMock.afterEach();
	} );

	it( 'should show all the applied element classes, ordered by priority, and mark the active one', () => {
		// Act.
		renderComponent( { active: 'provider-1-b' } );

		// Assert.
		const applied = screen.getAllByRole( 'group' );

		// Assert - Does not show placeholder text if there are applied classes.
		expect( screen.queryByPlaceholderText( 'Type class name' ) ).not.toBeInTheDocument();

		// Assert - Check if useElementSetting called with the correct arguments.
		expect( useElementSetting ).toHaveBeenCalledWith( 'mock-element', 'my-classes' );

		// Assert - Check if applied class exist in the document.
		expect( applied ).toHaveLength( 3 );
		expect( applied[ 0 ] ).toHaveTextContent( 'Local' );
		expect( localProvider.actions.all ).toHaveBeenCalledWith( { elementId: 'mock-element' } );
		expect( applied[ 1 ] ).toHaveTextContent( 'Provider-1-a' );
		expect( applied[ 2 ] ).toHaveTextContent( 'Provider-1-b' );

		// Assert - Check if the active class marked as active.
		expect(
			within( applied[ 2 ] ).getByRole( 'button', {
				name: 'Provider-1-b',
			} )
		).toHaveAttribute( 'aria-pressed', 'true' );
	} );

	it( 'should activate class on click', () => {
		// Arrange.
		const setActive = jest.fn();

		renderComponent( { setActive, active: 'provider-1-a' } );

		// Act.
		fireEvent.click( screen.getByRole( 'button', { name: 'Provider-1-b' } ) );

		// Assert.
		expect( setActive ).toHaveBeenCalledWith( 'provider-1-b' );
	} );

	it( 'should list all available classes with filtering, excluding the applied and non editable ones', () => {
		// Arrange.
		jest.mocked( useElementSetting ).mockReturnValue( { value: [ 'local' ] } );

		const nonEditableProvider = createMockStylesProvider(
			{
				key: 'provider-3',
				labels: { plural: 'Provider 3', singular: 'Provider 3 Class' },
				actions: {
					updateProps: undefined,
				},
			},
			[ createMockStyleDefinition( { id: 'provider-3-a', label: 'Provider-3-a' } ) ]
		);

		jest.mocked( useProviders ).mockReturnValue( [ localProvider, provider1, provider2, nonEditableProvider ] );

		renderComponent( { active: 'provider-1-b' } );

		// Act.
		const input = screen.getByRole( 'combobox', { hidden: true } );

		fireEvent.change( input, { target: { value: 'P' } } );

		// Assert.
		expect( screen.getByRole( 'option', { name: 'Provider-1-a' } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'option', { name: 'Provider-1-b' } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'option', { name: 'Provider-2-a' } ) ).toBeInTheDocument();
		expect( screen.queryByRole( 'option', { name: 'Provider-3-a' } ) ).not.toBeInTheDocument();

		// Act - Search for applied class (local).
		fireEvent.change( input, { target: { value: 'L' } } );

		// Assert.
		expect( screen.queryByRole( 'option', { name: 'Local' } ) ).not.toBeInTheDocument();
	} );

	it( 'should automatically activate a class when applied', () => {
		// Arrange.
		const setActive = jest.fn();

		const appliedClasses = [ 'local', 'provider-1-b' ];
		jest.mocked( useElementSetting ).mockReturnValue( { value: appliedClasses } );
		jest.mocked( getElementSetting ).mockReturnValue( { value: appliedClasses } );

		renderComponent( { setActive, active: 'provider-1-b' } );

		// Act.
		fireEvent.change( screen.getByRole( 'combobox', { hidden: true } ), { target: { value: 'P' } } );
		fireEvent.click( screen.getByRole( 'option', { name: 'Provider-2-a' } ) );

		// Assert.
		expect( setActive ).toHaveBeenCalledWith( 'provider-2-a' );
		expect( updateElementSettings ).toHaveBeenCalledWith( {
			id: 'mock-element',
			props: {
				'my-classes': { $$type: 'classes', value: [ 'local', 'provider-1-b', 'provider-2-a' ] },
			},
			withHistory: false,
		} );
	} );

	it( 'should not apply the empty option', () => {
		// Arrange.
		jest.mocked( useProviders ).mockReturnValue( [
			createMockStylesProvider( { key: `${ ELEMENTS_STYLES_PROVIDER_KEY_PREFIX }1` } ),
			createMockStylesProvider( { key: 'provider-1' }, [
				createMockStyleDefinition( { id: 'provider-1-a', label: 'Provider-1-a' } ),
			] ),
		] );

		const appliedClasses: string[] = [];
		jest.mocked( useElementSetting ).mockReturnValue( { value: appliedClasses } );
		jest.mocked( getElementSetting ).mockReturnValue( { value: appliedClasses } );

		renderComponent( { active: null } );

		// Act.
		fireEvent.change( screen.getByRole( 'combobox', { hidden: true } ), { target: { value: 'P' } } );
		fireEvent.click( screen.getByRole( 'option', { name: 'Provider-1-a' } ) );

		// Assert.
		expect( updateElementSettings ).toHaveBeenCalledWith( {
			id: 'mock-element',
			props: {
				'my-classes': { $$type: 'classes', value: [ 'provider-1-a' ] },
			},
			withHistory: false,
		} );
	} );

	it( 'should unapply a class and activate the first one', () => {
		// Arrange.
		const appliedClasses = [ 'local', 'provider-1-b', 'provider-1-a' ];

		jest.mocked( useElementSetting ).mockReturnValue( { value: appliedClasses } );
		jest.mocked( getElementSetting ).mockReturnValue( { value: appliedClasses } );

		const setActive = jest.fn();

		renderComponent( { active: 'provider-1-b', setActive } );

		// Act.
		fireEvent.keyDown( screen.getByRole( 'combobox', { hidden: true } ), { key: 'Backspace', keyCode: 8 } );

		// Assert.
		expect( updateElementSettings ).toHaveBeenCalledWith( {
			id: 'mock-element',
			props: {
				'my-classes': { $$type: 'classes', value: [ 'local', 'provider-1-a' ] },
			},
			withHistory: false,
		} );

		expect( setActive ).toHaveBeenCalledWith( 'local' );
	} );

	it( 'should disallow deleting the elements provider classes', () => {
		// Arrange.
		jest.mocked( useElementSetting ).mockReturnValue( { value: [ 'local' ] } );

		const setActive = jest.fn();

		renderComponent( { active: 'local', setActive } );

		// Act.
		fireEvent.keyDown( screen.getByRole( 'combobox', { hidden: true } ), { key: 'Backspace', keyCode: 8 } );

		// Assert.
		expect( updateElementSettings ).not.toHaveBeenCalled();
		expect( setActive ).not.toHaveBeenCalled();
	} );

	it( 'should apply and activate the empty class if there are no elements provider classes', () => {
		// Arrange.
		jest.mocked( useProviders ).mockReturnValue( [
			createMockStylesProvider( { key: `${ ELEMENTS_STYLES_PROVIDER_KEY_PREFIX }1` } ),
			createMockStylesProvider( { key: 'provider-1' }, [
				createMockStyleDefinition( { id: 'provider-1-a', label: 'Provider-1-a' } ),
			] ),
		] );

		jest.mocked( useElementSetting ).mockReturnValue( { value: [ 'provider-1-a' ] } );

		// Act.
		renderComponent( { active: null } );

		// Assert.
		expect( screen.getByRole( 'button', { name: 'local', pressed: true } ) ).toBeInTheDocument();
	} );

	it( 'should show the "Create" action if no class matches the search text', () => {
		// Arrange.
		renderComponent( { active: 'provider-1-b' } );

		// Act.
		const input = screen.getByRole( 'combobox', { hidden: true } );

		fireEvent.change( input, { target: { value: 'non existing class' } } );

		//Assert.
		const groupsIds = screen
			.getAllByRole( 'option', { name: 'Create "non existing class"' } )
			.map( ( option ) => option.getAttribute( 'data-group' ) );

		expect( groupsIds ).toContain( 'Create a new Provider 1 Class' );
	} );

	it( 'should not show the "Create" action if the search text is not valid class', () => {
		// Arrange.
		jest.mocked( validateStyleLabel ).mockReturnValue( { isValid: false, errorMessage: 'Test message' } );

		renderComponent( { active: 'provider-1-b' } );

		// Act.
		const input = screen.getByRole( 'combobox', { hidden: true } );

		fireEvent.change( input, { target: { value: '*Provider-1-a' } } );

		// Assert.
		expect( screen.queryByRole( 'option', { name: 'Create "Provider-1-a"' } ) ).not.toBeInTheDocument();
	} );

	it( 'should not show the "Create" action if the max classes limit has reached', () => {
		// Arrange.
		jest.mocked( useGetStylesRepositoryCreateAction ).mockReturnValue( [ { ...provider1, limit: 1 }, jest.fn() ] );

		renderComponent( { active: 'provider-1-b' } );

		// Act.
		const input = screen.getByRole( 'combobox', { hidden: true } );

		fireEvent.change( input, { target: { value: 'Provider-1-a' } } );

		// Assert.
		expect( screen.queryByRole( 'option', { name: 'Create "Provider-1-a"' } ) ).not.toBeInTheDocument();
	} );

	it( 'should create, apply, and activate a class on click', async () => {
		// Arrange.
		const appliedIds = [ 'local', 'provider-1-b' ];

		jest.mocked( useElementSetting ).mockReturnValue( { value: appliedIds } );
		jest.mocked( getElementSetting ).mockReturnValue( { value: appliedIds } );

		const setActive = jest.fn();
		const createClass = jest.fn().mockReturnValue( 'new-class-id' );

		jest.mocked( useGetStylesRepositoryCreateAction ).mockReturnValue( [
			createMockStylesProvider( { key: 'provider-1' } ),
			createClass,
		] );

		renderComponent( { active: 'provider-1-b', setActive } );

		// Act.
		fireEvent.change( screen.getByRole( 'combobox', { hidden: true } ), { target: { value: 'class-name' } } );
		fireEvent.click( screen.getByRole( 'option', { name: 'Create "class-name"' } ) );

		// Assert.
		await waitFor( () => {
			expect( createClass ).toHaveBeenCalledWith( 'class-name' );
		} );

		expect( updateElementSettings ).toHaveBeenCalledWith( {
			id: 'mock-element',
			props: {
				'my-classes': { $$type: 'classes', value: [ 'local', 'provider-1-b', 'new-class-id' ] },
			},
			withHistory: false,
		} );

		await waitFor( () => expect( setActive ).toHaveBeenCalledWith( 'new-class-id' ) );
	} );

	it( 'should create, apply, and activate a class on enter', async () => {
		// Arrange.
		const appliedIds = [ 'local', 'provider-1-b' ];

		jest.mocked( useElementSetting ).mockReturnValue( { value: appliedIds } );
		jest.mocked( getElementSetting ).mockReturnValue( { value: appliedIds } );

		const setActive = jest.fn();
		const createClass = jest.fn().mockReturnValue( 'new-class-id' );

		jest.mocked( useGetStylesRepositoryCreateAction ).mockReturnValue( [
			createMockStylesProvider( { key: 'provider-1' } ),
			createClass,
		] );

		renderComponent( { active: 'provider-1-b', setActive } );

		// Act.
		const input = screen.getByRole( 'combobox', { hidden: true } );
		fireEvent.change( input, { target: { value: 'class-name' } } );
		fireEvent.keyDown( input, { key: 'Enter' } );

		// Assert.
		expect( createClass ).toHaveBeenCalledWith( 'class-name' );

		expect( updateElementSettings ).toHaveBeenCalledWith( {
			id: 'mock-element',
			props: {
				'my-classes': { $$type: 'classes', value: [ 'local', 'provider-1-b', 'new-class-id' ] },
			},
			withHistory: false,
		} );

		await waitFor( () => expect( setActive ).toHaveBeenCalledWith( 'new-class-id' ) );
	} );

	it( 'should not create, apply, or activate a class on enter if the label is invalid', async () => {
		// Arrange.
		const setActive = jest.fn();
		const createClass = jest.fn().mockReturnValue( 'new-class-id' );

		jest.mocked( useGetStylesRepositoryCreateAction ).mockReturnValue( [
			createMockStylesProvider( { key: 'provider-1' } ),
			createClass,
		] );

		jest.mocked( validateStyleLabel ).mockReturnValue( { isValid: false, errorMessage: 'Test Message' } );

		renderComponent( { active: 'provider-1-b', setActive } );

		// Act.
		const input = screen.getByRole( 'combobox', { hidden: true } );

		fireEvent.change( input, { target: { value: 'invalid.classname' } } );
		fireEvent.keyDown( input, { key: 'Enter' } );

		// Assert.
		expect( createClass ).not.toHaveBeenCalled();

		expect( updateElementSettings ).not.toHaveBeenCalled();

		expect( setActive ).not.toHaveBeenCalled();
	} );

	it( 'should not create, apply, or activate a class on enter if the classes max limit has reached.', async () => {
		// Arrange.
		const setActive = jest.fn();
		const createClass = jest.fn().mockReturnValue( 'new-class-id' );

		jest.mocked( useGetStylesRepositoryCreateAction ).mockReturnValue( [
			createMockStylesProvider( { key: 'provider-1', limit: 0 } ),
			createClass,
		] );

		renderComponent( { active: 'provider-1-b', setActive } );

		// Act.
		const input = screen.getByRole( 'combobox', { hidden: true } );

		fireEvent.change( input, { target: { value: 'invalid.classname' } } );
		fireEvent.keyDown( input, { key: 'Enter' } );

		// Assert.
		expect( createClass ).not.toHaveBeenCalled();

		expect( updateElementSettings ).not.toHaveBeenCalled();

		expect( setActive ).not.toHaveBeenCalled();
	} );

	it( 'should not display any Pseudo classes if none is active', () => {
		// Arrange.
		jest.mocked( useElementSetting ).mockReturnValue( { value: [ 'local', 'provider-1-b' ] } );

		const setActive = jest.fn();
		const setActiveMetaState = jest.fn();

		// Act.
		renderComponent( { active: 'local', setActive, setActiveMetaState } );

		const chipGroups = screen.getAllByRole( 'group' );

		const chipMenus = chipGroups.map( ( chipGroup ) =>
			within( chipGroup ).getByLabelText( __( 'Open CSS Class Menu', 'elementor' ) )
		);

		// Assert.
		chipGroups.forEach( ( chipGroup ) => {
			expect( chipGroup ).toBeInTheDocument();
			expect(
				within( chipGroup ).getByLabelText( __( 'Open CSS Class Menu', 'elementor' ) )
			).toBeInTheDocument();
		} );

		expect( chipMenus[ 0 ] ).toHaveTextContent( '' );
		expect( chipMenus[ 1 ] ).toHaveTextContent( '' );
	} );

	it( 'should display the active Pseudo classes in the active style chip', () => {
		// Arrange.
		jest.mocked( useElementSetting ).mockReturnValue( { value: [ 'local', 'provider-1-b' ] } );

		const setActive = jest.fn();

		// Act.
		renderComponent( { active: 'local', setActive, state: 'hover' } );

		const chipGroups = screen.getAllByRole( 'group' );

		const chipMenus = chipGroups.map( ( chipGroup ) =>
			within( chipGroup ).getByLabelText( __( 'Open CSS Class Menu', 'elementor' ) )
		);

		// Assert.
		chipGroups.forEach( ( chipGroup ) => {
			expect( chipGroup ).toBeInTheDocument();
			expect(
				within( chipGroup ).getByLabelText( __( 'Open CSS Class Menu', 'elementor' ) )
			).toBeInTheDocument();
		} );

		expect( chipMenus[ 0 ] ).toHaveTextContent( 'hover' );
		expect( chipMenus[ 1 ] ).toHaveTextContent( '' );
	} );

	it( 'should show the Pseudo classes in the CSS menu and set the clicked selector as the active one', () => {
		// Arrange.
		jest.mocked( useElementSetting ).mockReturnValue( { value: [ 'local', 'provider-1-b', 'provider-1-a' ] } );

		const setActive = jest.fn();
		const setActiveMetaState = jest.fn();

		// Act.
		renderComponent( { active: 'local', setActive, setActiveMetaState } );

		const chipGroups = screen.getAllByRole( 'group' );

		const chipMenus = chipGroups.map( ( chipGroup ) =>
			within( chipGroup ).getByLabelText( __( 'Open CSS Class Menu', 'elementor' ) )
		);

		// Act.
		fireEvent.click( chipMenus[ 0 ] );

		const menu = screen.getByRole( 'menu' );

		// Assert.
		[ 'hover', 'focus' ].forEach( ( state ) => {
			expect( within( menu ).getByText( state ) ).toBeInTheDocument();
		} );

		// Act.
		fireEvent.click( within( menu ).getByText( 'hover' ) );

		// Assert.
		expect( setActive ).not.toHaveBeenCalled();
		expect( setActiveMetaState ).toHaveBeenCalledWith( 'hover' );
	} );

	it( 'should activate the right style definition if a Pseudo classes item of an inactive style css-class-menu is clicked', () => {
		// Arrange.
		jest.mocked( useElementSetting ).mockReturnValue( { value: [ 'local', 'provider-1-b', 'provider-1-a' ] } );

		const setActive = jest.fn();
		const setActiveMetaState = jest.fn();

		// Act.
		renderComponent( { active: 'local', setActive, setActiveMetaState, state: 'hover' } );

		const chipGroups = screen.getAllByRole( 'group' );

		const chipMenus = chipGroups.map( ( chipGroup ) =>
			within( chipGroup ).getByLabelText( __( 'Open CSS Class Menu', 'elementor' ) )
		);

		// Act - Open the CSS class menu.
		fireEvent.click( chipMenus[ 1 ] );

		// Act - Click on the hover Pseudo classes item.
		fireEvent.click( within( screen.getByRole( 'menu' ) ).getByText( 'hover' ) );

		// Assert.
		expect( setActive ).toHaveBeenCalledWith( 'provider-1-a' );
		expect( setActiveMetaState ).toHaveBeenCalledWith( 'hover' );
	} );

	it( 'should rename the active class on click', async () => {
		// Arrange.
		const mockProvider = createMockStylesProvider( { key: 'provider-1-b' } );

		jest.mocked( stylesRepository.getProviderByKey ).mockReturnValue( mockProvider );

		// Act.
		renderComponent( { active: 'provider-1-b' } );

		const activeEditableField = within( screen.getByRole( 'group', { name: 'Edit Provider-1-b' } ) ).getByRole(
			'button',
			{ name: 'Provider-1-b' }
		);

		fireEvent.click( activeEditableField );

		// Assert.
		const editableField = within( activeEditableField ).getByRole( 'textbox' );

		expect( editableField ).toHaveTextContent( 'Provider-1-b' );

		// Act.
		fireEvent.input( editableField, { target: { innerText: 'GG' } } );
		fireEvent.keyDown( editableField, { key: 'Enter' } );

		// Assert
		await waitFor( () => {
			expect( mockProvider.actions.update ).toHaveBeenCalledWith( { label: 'GG', id: 'provider-1-b' } );
		} );
	} );

	it( 'should not rename the class if validation failed', () => {
		// Arrange.
		const mockProvider = createMockStylesProvider( { key: 'provider-1-b' } );
		jest.mocked( stylesRepository.getProviderByKey ).mockReturnValue( mockProvider );
		jest.mocked( validateStyleLabel ).mockReturnValue( { isValid: false, errorMessage: 'Test error message' } );

		// Act.
		renderComponent( { active: 'provider-1-b' } );

		const activeEditableField = within( screen.getByRole( 'group', { name: 'Edit Provider-1-b' } ) ).getByRole(
			'button',
			{ name: 'Provider-1-b' }
		);

		fireEvent.click( activeEditableField );

		// Assert.
		const editableField = within( activeEditableField ).getByRole( 'textbox' );

		expect( editableField ).toHaveTextContent( 'Provider-1-b' );

		// Act.
		fireEvent.input( editableField, { target: { innerText: 'Provider-1-a' } } );

		fireEvent.keyDown( editableField, { key: 'Enter' } );

		//Assert
		expect( screen.getByText( 'Test error message' ) ).toBeInTheDocument();
		expect( mockProvider.actions.update ).not.toHaveBeenCalled();
	} );

	it( "should not allow renaming the elements provider classes if there's no provider", () => {
		// Arrange.
		// @ts-expect-error - passing null for testing purposes.
		jest.mocked( stylesRepository.getProviderByKey ).mockReturnValue( null );

		// Act.
		renderComponent( { active: 'provider-1-b' } );

		const activeEditableField = within( screen.getByRole( 'group', { name: 'Edit Provider-1-b' } ) ).getByRole(
			'button',
			{ name: 'Provider-1-b' }
		);

		fireEvent.doubleClick( activeEditableField );

		// Assert.
		const editableField = within( activeEditableField ).queryByRole( 'textbox' );

		expect( editableField ).not.toBeInTheDocument();
	} );

	it( 'should not allow renaming the elements provider classes if the provider does not support update action', () => {
		// Arrange.
		const mockProvider = createMockStylesProvider( { key: 'provider-1-b' } );

		jest.mocked( stylesRepository.getProviderByKey ).mockReturnValue( {
			...mockProvider,
			actions: {
				...mockProvider.actions,
				update: undefined,
			},
		} );

		// Act.
		renderComponent( { active: 'provider-1-b' } );

		const activeEditableField = within( screen.getByRole( 'group', { name: 'Edit Provider-1-b' } ) ).getByRole(
			'button',
			{ name: 'Provider-1-b' }
		);

		fireEvent.doubleClick( activeEditableField );

		// Assert.
		const editableField = within( activeEditableField ).queryByRole( 'textbox' );

		expect( editableField ).not.toBeInTheDocument();
	} );

	it( 'should show a style indicator for styled states within the states sub menu', () => {
		// Arrange.
		jest.mocked( useElementSetting ).mockReturnValue( { value: [ 'local' ] } );

		const setActive = jest.fn();
		const setActiveMetaState = jest.fn();

		// Act.
		renderComponent( { active: 'local', setActive, setActiveMetaState } );

		const chipGroups = screen.getAllByRole( 'group' );

		const chipMenus = chipGroups.map( ( chipGroup ) =>
			within( chipGroup ).getByLabelText( __( 'Open CSS Class Menu', 'elementor' ) )
		);

		fireEvent.click( chipMenus[ 0 ] );

		const menu = screen.getByRole( 'menu' );
		const menuItems = within( menu ).getAllByRole( 'menuitem' );

		// Assert.
		const normalItem = menuItems.find( ( el ) => within( el ).queryByText( 'normal' ) );
		const hoverItem = menuItems.find( ( el ) => within( el ).queryByText( 'hover' ) );
		const focusItem = menuItems.find( ( el ) => within( el ).queryByText( 'focus' ) );

		expect( hoverItem ).toBeInTheDocument();

		if ( ! normalItem || ! hoverItem || ! focusItem ) {
			throw new Error( 'missing state items' );
		}

		expect( within( normalItem ).getByLabelText( 'Has style' ) ).toBeInTheDocument();
		expect( within( hoverItem ).getByLabelText( 'Has style' ) ).toBeInTheDocument();
		expect( within( focusItem ).queryByLabelText( 'Has style' ) ).not.toBeInTheDocument();
	} );

	describe( 'Global class menu section', () => {
		it( 'should not show global class menu items for a local class', () => {
			// Arrange.
			jest.mocked( useElementSetting ).mockReturnValue( { value: [ 'local', 'provider-1-b', 'provider-1-a' ] } );

			renderComponent( { active: 'provider-1-b' } );

			jest.mocked( stylesRepository.getProviderByKey ).mockReturnValue( localProvider );

			// Act.
			const localClass = screen.getByRole( 'group', { name: __( 'Edit Local', 'elementor' ) } );
			const classToRemoveMenuTrigger = within( localClass ).getByLabelText(
				__( 'Open CSS Class Menu', 'elementor' )
			);

			fireEvent.click( classToRemoveMenuTrigger );
			const menu = screen.getByRole( 'menu' );
			const removeButton = within( menu ).queryByText( 'Remove' );

			// Assert.
			expect( removeButton ).not.toBeInTheDocument();
		} );

		it( 'should unapply a class when the "Remove" button is clicked', () => {
			// Arrange.
			const appliedClasses = [ 'local', 'provider-1-b', 'provider-1-a' ];

			jest.mocked( useElementSetting ).mockReturnValue( { value: appliedClasses } );
			jest.mocked( getElementSetting ).mockReturnValue( { value: appliedClasses } );

			renderComponent( { active: 'provider-1-b' } );
			jest.mocked( stylesRepository.getProviderByKey ).mockReturnValue( provider1 );

			// Act.
			const classToRemove = screen.getByRole( 'group', { name: __( 'Edit Provider-1-b', 'elementor' ) } );
			const classToRemoveMenuTrigger = within( classToRemove ).getByLabelText(
				__( 'Open CSS Class Menu', 'elementor' )
			);

			fireEvent.click( classToRemoveMenuTrigger );
			const menu = screen.getByRole( 'menu' );
			const removeButton = within( menu ).getByText( 'Remove' );

			// Assert.
			expect( removeButton ).toBeInTheDocument();

			// Act.
			fireEvent.click( removeButton );

			// Assert.
			expect( updateElementSettings ).toHaveBeenCalledWith( {
				id: 'mock-element',
				props: {
					'my-classes': { $$type: 'classes', value: [ 'local', 'provider-1-a' ] },
				},
				withHistory: false,
			} );
		} );

		it( 'should rename a class when the "Rename" button is clicked', async () => {
			// Arrange.
			jest.mocked( useElementSetting ).mockReturnValue( { value: [ 'local', 'provider-1-b', 'provider-1-a' ] } );

			const mockProvider = createMockStylesProvider( { key: 'provider-1-b' } );
			jest.mocked( stylesRepository.getProviderByKey ).mockReturnValue( mockProvider );

			renderComponent( { active: 'provider-1-b' } );

			// Act.
			const classToRename = screen.getByRole( 'group', { name: __( 'Edit Provider-1-a', 'elementor' ) } );
			const classToRenameMenuTrigger = within( classToRename ).getByLabelText(
				__( 'Open CSS Class Menu', 'elementor' )
			);

			fireEvent.click( classToRenameMenuTrigger );
			const menu = screen.getByRole( 'menu' );

			const renameButton = within( menu ).getByText( 'Rename' );
			fireEvent.click( renameButton );

			// Assert.
			expect( screen.queryByRole( 'menu' ) ).not.toBeInTheDocument();

			const editableField = within( classToRename ).getByRole( 'textbox' );
			expect( editableField ).toHaveTextContent( 'Provider-1-a' );

			// Act.
			fireEvent.input( editableField, { target: { innerText: 'new-class-name' } } );
			fireEvent.keyDown( editableField, { key: 'Enter' } );

			// Assert
			await waitFor( () => {
				expect( mockProvider.actions.update ).toHaveBeenCalledWith( {
					label: 'new-class-name',
					id: 'provider-1-a',
				} );
			} );
		} );

		it( 'should disable the"Rename" button if user does not have the update capability', () => {
			// Arrange.
			jest.mocked( useElementSetting ).mockReturnValue( { value: [ 'local', 'provider-1-b', 'provider-1-a' ] } );
			jest.mocked( useUserStylesCapability ).mockReturnValue( {
				userCan: () => ( {
					update: false,
					updateProps: true,
					create: true,
					delete: true,
				} ),
			} );
			const mockProvider = createMockStylesProvider( { key: 'provider-1-b' } );
			jest.mocked( stylesRepository.getProviderByKey ).mockReturnValue( mockProvider );

			// Act.
			renderComponent( { active: 'provider-1-b' } );

			const classToRename = screen.getByRole( 'group', { name: __( 'Edit Provider-1-a', 'elementor' ) } );
			const classToRenameMenuTrigger = within( classToRename ).getByLabelText(
				__( 'Open CSS Class Menu', 'elementor' )
			);
			fireEvent.click( classToRenameMenuTrigger );
			const menu = screen.getByRole( 'menu' );
			const renameButton = within( menu ).getByRole( 'menuitem', { name: 'Rename' } );

			// Assert.
			expect( renameButton ).toBeInTheDocument();
			expect( renameButton ).toHaveAttribute( 'aria-disabled', 'true' );
		} );

		it( 'should not allow inline rename if user does not have the update capability', () => {
			// Arrange.
			jest.mocked( useElementSetting ).mockReturnValue( { value: [ 'local', 'provider-1-b', 'provider-1-a' ] } );
			jest.mocked( useUserStylesCapability ).mockReturnValue( {
				userCan: () => ( {
					update: false,
					updateProps: true,
					create: true,
					delete: true,
				} ),
			} );
			// Arrange.
			const mockProvider = createMockStylesProvider( { key: 'provider-1-b' } );

			jest.mocked( stylesRepository.getProviderByKey ).mockReturnValue( mockProvider );

			// Act.
			renderComponent( { active: 'provider-1-b' } );

			const activeEditableField = within( screen.getByRole( 'group', { name: 'Edit Provider-1-b' } ) ).getByRole(
				'button',
				{ name: 'Provider-1-b' }
			);

			fireEvent.click( activeEditableField );

			// Assert.
			const editableField = within( activeEditableField ).queryByRole( 'textbox' );
			expect( editableField ).not.toBeInTheDocument();
		} );

		it( 'should disable the state item if the user does not have the updateProps capability', () => {
			// Arrange.
			jest.mocked( useElementSetting ).mockReturnValue( { value: [ 'local', 'provider-1-b', 'provider-1-a' ] } );
			jest.mocked( useUserStylesCapability ).mockReturnValue( {
				userCan: () => ( {
					update: true,
					updateProps: false,
					create: true,
					delete: true,
				} ),
			} );

			const mockProvider = createMockStylesProvider( { key: 'provider-1-b' } );
			jest.mocked( stylesRepository.getProviderByKey ).mockReturnValue( mockProvider );

			// Act.
			renderComponent( { active: 'provider-1-b' } );

			const classToRename = screen.getByRole( 'group', { name: __( 'Edit Provider-1-a', 'elementor' ) } );
			const classToRenameMenuTrigger = within( classToRename ).getByLabelText(
				__( 'Open CSS Class Menu', 'elementor' )
			);

			fireEvent.click( classToRenameMenuTrigger );

			const menu = screen.getByRole( 'menu' );
			const hoverItem = within( menu ).getByRole( 'menuitem', { name: 'hover' } );

			// Assert.
			expect( hoverItem ).toBeInTheDocument();
			expect( hoverItem ).toHaveAttribute( 'aria-disabled', 'true' );
		} );

		it( 'should show info tip if the user does not have the updateProps capability for the active class', () => {
			// Arrange.
			jest.mocked( useElementSetting ).mockReturnValue( { value: [ 'local', 'provider-1-b', 'provider-1-a' ] } );
			jest.mocked( useUserStylesCapability ).mockReturnValue( {
				userCan: () => ( {
					update: true,
					updateProps: false,
					create: true,
					delete: true,
				} ),
			} );

			const mockProvider = createMockStylesProvider( { key: 'provider-1-b' } );
			jest.mocked( stylesRepository.getProviderByKey ).mockReturnValue( mockProvider );

			// Act.
			renderComponent( { active: 'provider-1-b' } );

			// Assert.
			expect(
				screen.getByText( 'With your current role, you can use existing classes but can’t modify them.' )
			).toBeInTheDocument();
		} );

		it( 'should not show info tip if the user has the updateProps capability for the active class', () => {
			// Arrange.
			jest.mocked( useElementSetting ).mockReturnValue( { value: [ 'local', 'provider-1-b', 'provider-1-a' ] } );
			jest.mocked( useUserStylesCapability ).mockReturnValue( {
				userCan: () => ( {
					update: true,
					updateProps: true,
					create: true,
					delete: true,
				} ),
			} );
			const mockProvider = createMockStylesProvider( { key: 'provider-1-b' } );
			jest.mocked( stylesRepository.getProviderByKey ).mockReturnValue( mockProvider );

			// Act.
			renderComponent( { active: 'provider-1-b' } );

			// Assert.
			expect(
				screen.queryByText( 'With your current role, you can use existing classes but can’t modify them.' )
			).not.toBeInTheDocument();
		} );

		it( 'should not disable normal state item if the user does not have the updateProps capability', () => {
			// Arrange.
			jest.mocked( useElementSetting ).mockReturnValue( { value: [ 'local', 'provider-1-b', 'provider-1-a' ] } );
			jest.mocked( useUserStylesCapability ).mockReturnValue( {
				userCan: () => ( {
					update: true,
					updateProps: false,
					create: true,
					delete: true,
				} ),
			} );

			const mockProvider = createMockStylesProvider( { key: 'provider-1-b' } );
			jest.mocked( stylesRepository.getProviderByKey ).mockReturnValue( mockProvider );

			// Act.
			renderComponent( { active: 'provider-1-b' } );

			const classToRename = screen.getByRole( 'group', { name: __( 'Edit Provider-1-a', 'elementor' ) } );
			const classToRenameMenuTrigger = within( classToRename ).getByLabelText(
				__( 'Open CSS Class Menu', 'elementor' )
			);

			fireEvent.click( classToRenameMenuTrigger );

			const menu = screen.getByRole( 'menu' );
			const normalItem = within( menu ).getByRole( 'menuitem', { name: 'normal' } );

			// Assert.
			expect( normalItem ).toBeInTheDocument();
			expect( normalItem ).not.toHaveAttribute( 'aria-disabled', 'true' );
		} );

		it( 'should not show the "Remove" button for a local class', () => {
			// Arrange.
			jest.mocked( useElementSetting ).mockReturnValue( { value: [ 'local', 'provider-1-b', 'provider-1-a' ] } );
			jest.mocked( stylesRepository.getProviderByKey ).mockReturnValue( localProvider );

			// Act.
			renderComponent( { active: 'local' } );

			const localClass = screen.getByRole( 'group', { name: __( 'Edit Local', 'elementor' ) } );
			const classToRemoveMenuTrigger = within( localClass ).getByLabelText( 'Open CSS Class Menu' );

			fireEvent.click( classToRemoveMenuTrigger );

			const menu = screen.getByRole( 'menu' );
			const removeButton = within( menu ).queryByText( 'Remove' );

			// Assert.
			expect( removeButton ).not.toBeInTheDocument();
		} );

		it( 'should show placeholder text when there are no applied classes', () => {
			// Arrange.
			jest.mocked( useElementSetting ).mockReturnValue( { value: [] } );

			renderComponent( { active: null } );

			// Assert.
			expect( screen.getByPlaceholderText( 'Type class name' ) ).toBeInTheDocument();
		} );
	} );

	describe( 'Class history', () => {
		beforeEach( () => {
			jest.mocked( getElementLabel ).mockImplementation( ( id ) => {
				return id === 'mock-element' ? 'Mock Element' : '';
			} );
		} );

		const setupElementSettings = ( _appliedClasses: string[] ) => {
			let appliedClasses = _appliedClasses;

			jest.mocked( getElementSetting ).mockImplementation( () => ( { value: appliedClasses } ) );
			jest.mocked( useElementSetting ).mockImplementation( () => ( { value: appliedClasses } ) );

			jest.mocked( updateElementSettings ).mockImplementation( ( { props } ) => {
				appliedClasses = ( props?.[ 'my-classes' ] as { value: string[] } )?.value;
			} );
		};

		it( 'should support undo/redo for class apply', () => {
			// Arrange.
			setupElementSettings( [ 'local', 'provider-1-b' ] );

			jest.mocked( useProviders ).mockReturnValue( [ localProvider, provider1, provider2 ] );

			const setActive = jest.fn();

			renderComponent( { active: 'provider-1-b', setActive } );

			// Act - Apply class.
			const input = screen.getByRole( 'combobox', { hidden: true } );
			fireEvent.change( input, { target: { value: 'p' } } );
			fireEvent.click( screen.getByRole( 'option', { name: 'Provider-1-a' } ) );

			// Assert.
			expect( updateElementSettings ).toHaveBeenCalledWith( {
				id: 'mock-element',
				props: { 'my-classes': { $$type: 'classes', value: [ 'local', 'provider-1-b', 'provider-1-a' ] } },
				withHistory: false,
			} );
			expect( setActive ).toHaveBeenCalledWith( 'provider-1-a' );

			const historyItem = historyMock.instance.get();
			expect( historyItem?.title ).toBe( 'Mock Element' );
			expect( historyItem?.subTitle ).toBe( 'class Provider-1-a applied' );

			// Act - Undo.
			act( () => {
				historyMock.instance.undo();
			} );

			// Assert - Class removed.
			expect( updateElementSettings ).toHaveBeenCalledWith( {
				id: 'mock-element',
				props: { 'my-classes': { $$type: 'classes', value: [ 'local', 'provider-1-b' ] } },
				withHistory: false,
			} );
			expect( setActive ).toHaveBeenCalledWith( 'provider-1-b' );

			// Act - Redo.
			act( () => {
				historyMock.instance.redo();
			} );

			// Assert - Class re-applied.
			expect( updateElementSettings ).toHaveBeenCalledWith( {
				id: 'mock-element',
				props: { 'my-classes': { $$type: 'classes', value: [ 'local', 'provider-1-b', 'provider-1-a' ] } },
				withHistory: false,
			} );
			expect( setActive ).toHaveBeenCalledWith( 'provider-1-a' );
		} );

		it( 'should support undo/redo for class unapply', () => {
			// Arrange.
			setupElementSettings( [ 'local', 'provider-1-b', 'provider-1-a' ] );

			jest.mocked( useProviders ).mockReturnValue( [ localProvider, provider1, provider2 ] );

			const setActive = jest.fn();

			renderComponent( { active: 'provider-1-b', setActive } );
			// Act - Remove class.
			fireEvent.keyDown( screen.getByRole( 'combobox', { hidden: true } ), { key: 'Backspace', keyCode: 8 } );

			// Assert - Class removed.
			expect( updateElementSettings ).toHaveBeenCalledWith( {
				id: 'mock-element',
				props: { 'my-classes': { $$type: 'classes', value: [ 'local', 'provider-1-a' ] } },
				withHistory: false,
			} );
			expect( setActive ).toHaveBeenCalledWith( 'local' );

			const historyItem = historyMock.instance.get();
			expect( historyItem?.title ).toBe( 'Mock Element' );
			expect( historyItem?.subTitle ).toBe( 'class Provider-1-b removed' );

			// Act - Undo.
			act( () => {
				historyMock.instance.undo();
			} );

			// Assert - Class re-applied.
			expect( updateElementSettings ).toHaveBeenCalledWith( {
				id: 'mock-element',
				props: { 'my-classes': { $$type: 'classes', value: [ 'local', 'provider-1-a', 'provider-1-b' ] } },
				withHistory: false,
			} );
			expect( setActive ).toHaveBeenCalledWith( 'provider-1-b' );

			// Act - Redo.
			act( () => {
				historyMock.instance.redo();
			} );

			// Assert - Class removed again.
			expect( updateElementSettings ).toHaveBeenCalledWith( {
				id: 'mock-element',
				props: { 'my-classes': { $$type: 'classes', value: [ 'local', 'provider-1-a' ] } },
				withHistory: false,
			} );
			expect( setActive ).toHaveBeenCalledWith( 'local' );
		} );

		it( 'should support undo/redo for new class create and apply', async () => {
			// Arrange.
			setupElementSettings( [ 'local' ] );

			const setActive = jest.fn();
			const createClass = jest
				.fn()
				.mockReturnValueOnce( 'new-class-id-1' )
				.mockReturnValueOnce( 'new-class-id-2' );
			const deleteClass = jest.fn();

			const mockProvider = createMockStylesProvider( {
				key: 'provider-4',
				actions: { create: createClass, delete: deleteClass },
			} );
			jest.mocked( useGetStylesRepositoryCreateAction ).mockReturnValue( [ mockProvider, createClass ] );
			jest.mocked( useProviders ).mockReturnValue( [ localProvider, mockProvider ] );

			renderComponent( { active: 'local', setActive } );

			// Act - Create new class.
			const input = screen.getByRole( 'combobox', { hidden: true } );
			fireEvent.change( input, { target: { value: 'class-name' } } );
			fireEvent.keyDown( input, { key: 'Enter' } );

			// Assert - Class created and applied.
			await waitFor( () => expect( createClass ).toHaveBeenCalledWith( 'class-name' ) );
			expect( updateElementSettings ).toHaveBeenNthCalledWith( 1, {
				id: 'mock-element',
				props: { 'my-classes': { $$type: 'classes', value: [ 'local', 'new-class-id-1' ] } },
				withHistory: false,
			} );
			expect( setActive ).toHaveBeenCalledWith( 'new-class-id-1' );

			const historyItem = historyMock.instance.get();
			expect( historyItem?.title ).toBe( 'Class' );
			expect( historyItem?.subTitle ).toBe( 'class-name created' );

			// Act - Undo.
			act( () => {
				historyMock.instance.undo();
			} );

			// Assert - Class unapplied and deleted.
			expect( updateElementSettings ).toHaveBeenNthCalledWith( 2, {
				id: 'mock-element',
				props: { 'my-classes': { $$type: 'classes', value: [ 'local' ] } },
				withHistory: false,
			} );
			expect( deleteClass ).toHaveBeenCalledWith( 'new-class-id-1' );
			expect( setActive ).toHaveBeenCalledWith( 'local' );

			// Act - Redo.
			act( () => {
				historyMock.instance.redo();
			} );

			// Assert - Class re-created and applied.
			expect( updateElementSettings ).toHaveBeenNthCalledWith( 3, {
				id: 'mock-element',
				props: { 'my-classes': { $$type: 'classes', value: [ 'local', 'new-class-id-2' ] } },
				withHistory: false,
			} );
			expect( setActive ).toHaveBeenCalledWith( 'new-class-id-2' );
		} );
	} );
} );

type Options = {
	active: 'local' | 'provider-1-a' | 'provider-1-b' | 'provider-2-a' | null;
	setActive?: () => void;
	state?: StyleDefinitionState;
	setActiveMetaState?: () => void;
};

function renderComponent( { setActive = () => {}, active, state = null, setActiveMetaState = () => {} }: Options ) {
	return renderWithTheme(
		<ElementProvider
			element={ { id: 'mock-element', type: 'mock-element-type' } }
			elementType={ createMockElementType( { key: 'mock-element-type' } ) }
		>
			<ClassesPropProvider prop="my-classes">
				<StyleProvider
					id={ active }
					setId={ setActive }
					meta={ { breakpoint: 'mobile', state } }
					setMetaState={ setActiveMetaState }
				>
					<CssClassSelector />
				</StyleProvider>
			</ClassesPropProvider>
		</ElementProvider>
	);
}
