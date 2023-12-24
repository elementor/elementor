import ExperimentsMessages from 'elementor/core/experiments/assets/js/admin/behaviors/experiments-messages';
import {
	mockExperimentsConfig,
	mockExperimentsForm,
	activateExperiment,
	deactivateExperiment,
	resetExperiment,
	getExperimentState,
	mockDialog,
} from './utils';

describe( 'ExperimentsMessages Behavior', () => {
	let experimentsMessages, elements;

	beforeEach( () => {
		mockExperimentsConfig();

		const form = mockExperimentsForm();

		document.body.innerHTML = '';
		document.body.appendChild( form );

		elements = {
			form,
			selects: [ ...form.querySelectorAll( 'select' ) ],
			submit: form.querySelector( 'input[type="submit"]' ),
		};

		experimentsMessages = new ExperimentsMessages( elements );
		experimentsMessages.bindEvents();
	} );

	it( 'Should show a dependency dialog when activating an experiment that has dependencies', () => {
		// Arrange.
		const { show } = mockDialog();

		// Act.
		activateExperiment( 'depends_on_inactive' );

		// Assert.
		expect( show ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'Should not show a dependency dialog when activating an experiment that has no dependencies', () => {
		// Arrange.
		const { show } = mockDialog();

		// Act.
		activateExperiment( 'inactive_dependency' );

		// Assert.
		expect( show ).not.toHaveBeenCalled();
	} );

	it( 'Should not show a dependency dialog when activating an experiment that has only active dependencies', () => {
		// Arrange.
		const { show } = mockDialog();

		// Act.
		activateExperiment( 'depends_on_active' );

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
		activateExperiment( 'depends_on_inactive' );
		confirm();

		// Assert.
		expect( getExperimentState( 'inactive_dependency' ) ).toBe( 'active' );
		expect( getExperimentState( 'depends_on_active' ) ).toBe( 'inactive' ); // Make sure not to touch others.
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
		activateExperiment( 'depends_on_inactive' );
		cancel();

		// Assert.
		expect( getExperimentState( 'depends_on_inactive' ) ).toBe( 'inactive' );
		expect( getExperimentState( 'inactive_dependency' ) ).toBe( 'inactive' );
		expect( submitMock ).not.toHaveBeenCalled();
	} );

	it( 'Should deactivate the experiments when deactivating their dependency ("state = active")', () => {
		// Arrange.
		activateExperiment( 'inactive_dependency' );
		activateExperiment( 'depends_on_inactive' );

		// Act.
		deactivateExperiment( 'inactive_dependency' );

		// Assert.
		expect( getExperimentState( 'inactive_dependency' ) ).toBe( 'inactive' );
		expect( getExperimentState( 'depends_on_inactive' ) ).toBe( 'inactive' );
	} );

	it( 'Should deactivate the experiments when deactivating their dependency ("state = default")', () => {
		// Arrange.
		activateExperiment( 'inactive_dependency' );
		activateExperiment( 'depends_on_inactive' );

		// Act.
		resetExperiment( 'inactive_dependency' );

		// Assert.
		expect( getExperimentState( 'inactive_dependency' ) ).toBe( 'default' );
		expect( getExperimentState( 'depends_on_inactive' ) ).toBe( 'inactive' );
	} );

	it( 'Should show the deactivate dialog when deactivating an experiment that has an \'on_deactivate\' message', () => {
		// Arrange.
		const { show } = mockDialog();

		// Act.
		deactivateExperiment( 'active_dependency' );

		// Assert.
		expect( show ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'Should not show the deactivate dialog when deactivating an experiment that has an \'on_deactivate\' message', () => {
		// Arrange.
		const { show } = mockDialog();

		// Act.
		deactivateExperiment( 'depends_on_active' );

		// Assert.
		expect( show ).not.toHaveBeenCalled();
	} );

	it( 'Should deactivate the experiment and its dependencies when clicking DEACTIVATE button', () => {
		// Arrange.
		const { confirm } = mockDialog(),
			submitMock = jest.fn();

		elements.form.addEventListener( 'submit', ( e ) => {
			submitMock();

			e.preventDefault();
		} );

		// Act.
		deactivateExperiment( 'active_dependency' );
		confirm();

		// Assert.
		expect( getExperimentState( 'active_dependency' ) ).toBe( 'inactive' );
		expect( getExperimentState( 'depends_on_active' ) ).toBe( 'inactive' );
		expect( submitMock ).toHaveBeenCalled();
	} );

	it( 'Should not deactivate the experiment and its dependencies when clicking DISMISS button', () => {
		// Arrange.
		const { cancel } = mockDialog();
		const submitMock = jest.fn();
		activateExperiment( 'depends_on_active' );

		elements.form.addEventListener( 'submit', ( e ) => {
			submitMock();

			e.preventDefault();
		} );

		// Act.
		deactivateExperiment( 'active_dependency' );
		cancel();

		// Assert.
		expect( getExperimentState( 'active_dependency' ) ).toBe( 'active' );
		expect( getExperimentState( 'depends_on_active' ) ).toBe( 'active' );
		expect( submitMock ).not.toHaveBeenCalled();
	} );

	it( 'Should not show the deactivate dialog when changing the select value from default to inactive while the experiment default value is inactive', () => {
		// Arrange
		const { createWidget } = mockDialog();

		// Act.
		deactivateExperiment( 'depends_on_inactive' );

		// Assert.
		expect( getExperimentState( 'depends_on_inactive' ) ).toBe( 'inactive' );
		expect( createWidget ).not.toHaveBeenCalled();
	} );

	it( 'Should show the deactivate dialog when changing the select value from default to inactive while exp default value is active', () => {
		// Arrange
		const { confirm } = mockDialog(),
			submitMock = jest.fn();

		elements.form.addEventListener( 'submit', ( e ) => {
			submitMock();

			e.preventDefault();
		} );

		resetExperiment( 'active_dependency' );

		// Act.
		deactivateExperiment( 'active_dependency' );
		confirm();

		// Assert.
		expect( getExperimentState( 'active_dependency' ) ).toBe( 'inactive' );
		expect( getExperimentState( 'depends_on_active' ) ).toBe( 'inactive' );
		expect( submitMock ).toHaveBeenCalled();
	} );

	it( 'Should not show the deactivate dialog when changing the select value from inactive to default while exp default value is active', () => {
		const { createWidget } = mockDialog();

		// Act.
		resetExperiment( 'default_active' );

		// Assert.
		expect( getExperimentState( 'default_active' ) ).toBe( 'default' );
		expect( createWidget ).not.toHaveBeenCalled();
	} );
} );

