import ExperimentsDependency from 'elementor/core/experiments/assets/js/admin/behaviors/experiments-dependency';
import {
	mockExperimentsConfig,
	mockExperimentsForm,
	activateExperiment,
	deactivateExperiment,
	getExperimentState,
	mockDialog,
} from './utils';

describe( 'ExperimentsDependency Behavior', () => {
	let experimentsDependency, elements;

	beforeEach( () => {
		mockExperimentsConfig();

		const form = mockExperimentsForm();

		document.body.innerHTML = '';
		document.body.appendChild( form );

		elements = {
			selects: [ ...document.querySelectorAll( 'select' ) ],
			form,
		};

		experimentsDependency = new ExperimentsDependency( elements );
		experimentsDependency.bindEvents();
	} );

	it( 'Should show a dependency dialog when activating an experiment that has dependencies', () => {
		// Arrange.
		const { show } = mockDialog();

		// Act.
		activateExperiment( 'depends_on_regular_inactive' );

		// Assert.
		expect( show ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'Should not show a dependency dialog when activating an experiment that has only hidden dependencies', () => {
		// Arrange.
		const { show } = mockDialog();

		// Act.
		activateExperiment( 'depends_on_hidden_inactive' );

		// Assert.
		expect( show ).not.toHaveBeenCalled();
	} );

	it( 'Should not show a dependency dialog when activating an experiment that has no dependencies', () => {
		// Arrange.
		const { show } = mockDialog();

		// Act.
		activateExperiment( 'regular_inactive_dependency' );

		// Assert.
		expect( show ).not.toHaveBeenCalled();
	} );

	it( 'Should not show a dependency dialog when activating an experiment that has only active dependencies', () => {
		// Arrange.
		const { show } = mockDialog();

		// Act.
		activateExperiment( 'depends_on_regular_active' );

		// Assert.
		expect( show ).not.toHaveBeenCalled();
	} );

	it( 'Should activate the experiment dependencies and submit the form on dialog confirm', () => {
		// Arrange.
		const { confirm } = mockDialog();
		const submitMock = jest.fn();

		/**
		 * Prevent form submission to avoid JSDOM `not-implemented` error.
		 *
		 * @see https://github.com/jsdom/jsdom/issues/1937
		 * @see https://github.com/jsdom/jsdom#unimplemented-parts-of-the-web-platform
		 * @see https://oliverjam.es/blog/frontend-testing-node-jsdom/#loading-external-resources
		 */
		elements.form.addEventListener( 'submit', ( e ) => {
			submitMock();

			e.preventDefault();
		} );

		// Act.
		activateExperiment( 'depends_on_regular_inactive' );
		confirm();

		// Assert.
		expect( getExperimentState( 'regular_inactive_dependency' ) ).toBe( 'active' );
		expect( getExperimentState( 'depends_on_hidden_active' ) ).toBe( 'inactive' ); // Make sure not to touch others.
		expect( submitMock ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'Should deactivate the experiment and don\'t send the form on dialog cancel', () => {
		// Arrange.
		const { cancel } = mockDialog();
		const submitMock = jest.fn();

		elements.form.addEventListener( 'submit', ( e ) => {
			submitMock();

			e.preventDefault();
		} );

		// Act.
		activateExperiment( 'depends_on_regular_inactive' );
		cancel();

		// Assert.
		expect( getExperimentState( 'depends_on_regular_inactive' ) ).toBe( 'inactive' );
		expect( getExperimentState( 'regular_inactive_dependency' ) ).toBe( 'inactive' );
		expect( submitMock ).not.toHaveBeenCalled();
	} );

	it( 'Should deactivate the experiments when deactivating their dependency', () => {
		// Arrange.
		activateExperiment( 'regular_inactive_dependency' );
		activateExperiment( 'depends_on_regular_inactive' );

		// Act.
		deactivateExperiment( 'regular_inactive_dependency' );

		// Assert.
		expect( getExperimentState( 'regular_inactive_dependency' ) ).toBe( 'inactive' );
		expect( getExperimentState( 'depends_on_regular_inactive' ) ).toBe( 'inactive' );
	} );
} );

