import ChecklistBehavior from './behavior';

export default class Module extends elementorModules.editor.utils.Module {

	getDefaultSettings() {
		return {
			selectors: {
			},
			controls: {
			},
		};
	}

	registerControlBehavior = ( behaviors, view ) => {
		if ( this.getSettings( 'controls' ).trigger !== view.options.model.get( 'name' ) ) {
			return behaviors;
		}

		if ( ! behaviors ) {
			behaviors = {};
		}

		behaviors.checklist = {
			behaviorClass: ChecklistBehavior,
			getStepsFromSource: () => {
				const steps= [{}];

				return steps;
			},
		};

		return behaviors;
	};

};

