import { fireEvent } from '@testing-library/dom';

export function activateExperiment( experimentId ) {
	const experiment = document.querySelector( `[data-experiment-id="${ experimentId }"]` );

	fireEvent.change( experiment, { target: { value: 'active' } } );
}

export function deactivateExperiment( experimentId ) {
	const experiment = document.querySelector( `[data-experiment-id="${ experimentId }"]` );

	fireEvent.change( experiment, { target: { value: 'inactive' } } );
}

export function getExperimentState( experimentId ) {
	return document.querySelector( `[data-experiment-id="${ experimentId }"]` ).value;
}

export function mockDialog() {
	const show = jest.fn();

	const confirm = () => {
		return window.currentDialog.config.onConfirm();
	};

	const cancel = () => {
		return window.currentDialog.config.onCancel();
	};

	window.elementorCommon = {
		dialogsManager: {
			createWidget: ( type, config ) => {
				// TODO: Find a better solution.
				window.currentDialog = { type, config };

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
			regular_active_dependency: {
				name: 'regular_active_dependency',
				state: 'default',
				default: 'active',
				hidden: false,
				dependencies: [],
			},
			hidden_active_dependency: {
				name: 'hidden_active_dependency',
				state: 'default',
				default: 'active',
				hidden: true,
				dependencies: [],
			},
			regular_inactive_dependency: {
				name: 'regular_inactive_dependency',
				state: 'inactive',
				default: 'inactive',
				hidden: false,
				dependencies: [],
			},
			hidden_inactive_dependency: {
				name: 'hidden_inactive_dependency',
				state: 'default',
				default: 'active',
				hidden: true,
				dependencies: [],
			},
			depends_on_regular_active: {
				name: 'depends_on_regular_active',
				state: 'inactive',
				default: 'inactive',
				hidden: false,
				dependencies: [
					'regular_active_dependency',
				],
			},
			depends_on_hidden_active: {
				name: 'depends_on_hidden_active',
				state: 'inactive',
				default: 'inactive',
				hidden: false,
				dependencies: [
					'hidden_active_dependency',
				],
			},
			depends_on_regular_inactive: {
				name: 'depends_on_regular_inactive',
				state: 'inactive',
				default: 'inactive',
				hidden: false,
				dependencies: [
					'regular_inactive_dependency',
				],
			},
			depends_on_hidden_inactive: {
				name: 'depends_on_hidden_inactive',
				state: 'inactive',
				default: 'inactive',
				hidden: false,
				dependencies: [
					'hidden_inactive_dependency',
				],
			},
		},
	};
}

export function mockExperimentsForm() {
	const form = document.createElement( 'form' );

	Object.values( window.elementorAdminConfig.experiments ).forEach( ( experiment ) => {
		if ( experiment.hidden ) {
			return;
		}

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
