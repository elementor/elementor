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
			form,
			selects: [ ...form.querySelectorAll( 'select' ) ],
			submit: form.querySelector( 'input[type="submit"]' ),
		};

		experimentsDependency = new ExperimentsDependency( elements );
		experimentsDependency.bindEvents();
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

		elements.form.addEventListener( 'submit', submitMock );

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

		elements.form.addEventListener( 'submit', submitMock );

		// Act.
		activateExperiment( 'depends_on_inactive' );
		cancel();

		// Assert.
		expect( getExperimentState( 'depends_on_inactive' ) ).toBe( 'inactive' );
		expect( getExperimentState( 'inactive_dependency' ) ).toBe( 'inactive' );
		expect( submitMock ).not.toHaveBeenCalled();
	} );

	it( 'Should deactivate the experiments when deactivating their dependency', () => {
		// Arrange.
		activateExperiment( 'inactive_dependency' );
		activateExperiment( 'depends_on_inactive' );

		// Act.
		deactivateExperiment( 'inactive_dependency' );

		// Assert.
		expect( getExperimentState( 'inactive_dependency' ) ).toBe( 'inactive' );
		expect( getExperimentState( 'depends_on_inactive' ) ).toBe( 'inactive' );
	} );
} );

