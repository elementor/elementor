import { fireEvent } from '@testing-library/dom';

export function activateExperiment( experimentId ) {
	setExperimentState( experimentId, 'active' );
}

export function deactivateExperiment( experimentId ) {
	setExperimentState( experimentId, 'inactive' );
}

export function resetExperiment( experimentId ) {
	setExperimentState( experimentId, 'default' );
}

function setExperimentState( experimentId, state ) {
	const experiment = document.querySelector( `[data-experiment-id="${ experimentId }"]` );

	fireEvent.change( experiment, { target: { value: state } } );
}

export function getExperimentState( experimentId ) {
	return document.querySelector( `[data-experiment-id="${ experimentId }"]` ).value;
}

export function mockDialog() {
	const show = jest.fn();

	let currentConfig = {};

	const confirm = () => {
		return currentConfig.onConfirm();
	};

	const cancel = () => {
		return currentConfig.onCancel();
	};

	const createWidget = jest.fn( ( type, config ) => {
		currentConfig = config;

		return {
			show,
		};
	} );

	window.elementorCommon = {
		dialogsManager: {
			createWidget,
		},
	};

	return {
		show,
		confirm,
		cancel,
		createWidget,
	};
}

export function mockExperimentsConfig() {
	window.elementorAdminConfig = {
		experiments: {
			active_dependency: {
				name: 'active_dependency',
				state: 'default',
				default: 'active',
				dependencies: [],
				messages: {
					on_deactivate: 'Active dependency is active',
				},
			},
			inactive_dependency: {
				name: 'inactive_dependency',
				state: 'inactive',
				default: 'inactive',
				dependencies: [],
				messages: [],
			},
			depends_on_active: {
				name: 'depends_on_active',
				state: 'inactive',
				default: 'inactive',
				dependencies: [
					'active_dependency',
				],
				messages: [],
			},
			depends_on_inactive: {
				name: 'depends_on_inactive',
				state: 'inactive',
				default: 'inactive',
				dependencies: [
					'inactive_dependency',
				],
				messages: [],
			},
			default_active: {
				name: 'default_active',
				state: 'inactive',
				default: 'active',
				dependencies: [],
				messages: {
					on_deactivate: 'Active dependency is active',
				},
			},
			depends_on_default_active: {
				name: 'depends_on_default_active',
				state: 'active',
				default: 'active',
				dependencies: [
					'default_active',
				],
				messages: [],
			},
		},
	};
}

export function mockExperimentsForm() {
	const form = document.createElement( 'form' );

	Object.values( window.elementorAdminConfig.experiments ).forEach( ( experiment ) => {
		form.innerHTML += `
			<select data-experiment-id="${ experiment.name }">
				<option value="default" ${ ( 'default' === experiment.state ) && 'selected' }>
					Default
				</option>
				<option value="active" ${ ( 'active' === experiment.state ) && 'selected' }>
					Active
				</option>
				<option value="inactive" ${ ( 'inactive' === experiment.state ) && 'selected' }>
					Inactive
				</option>
			</select>`;
	} );

	form.innerHTML += `<input type="submit" />`;

	return form;
}
