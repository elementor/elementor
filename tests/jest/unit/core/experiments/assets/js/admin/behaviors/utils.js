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

	window.elementorCommon = {
		dialogsManager: {
			createWidget: ( type, config ) => {
				currentConfig = config;

				return {
					show,
				};
			},
		},
	};

	return {
		show,
		confirm,
		cancel,
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
			},
			inactive_dependency: {
				name: 'inactive_dependency',
				state: 'inactive',
				default: 'inactive',
				dependencies: [],
			},
			depends_on_active: {
				name: 'depends_on_active',
				state: 'inactive',
				default: 'inactive',
				dependencies: [
					'active_dependency',
				],
			},
			depends_on_inactive: {
				name: 'depends_on_inactive',
				state: 'inactive',
				default: 'inactive',
				dependencies: [
					'inactive_dependency',
				],
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
