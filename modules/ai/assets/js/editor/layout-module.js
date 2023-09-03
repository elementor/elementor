import AiLayoutBehavior from './ai-layout-behavior';

export default class Module extends elementorModules.editor.utils.Module {
	onElementorInit() {
		elementor.hooks.addFilter( 'views/add-section/behaviors', this.registerAiLayoutBehavior );
	}

	registerAiLayoutBehavior( behaviors ) {
		behaviors.ai = {
			behaviorClass: AiLayoutBehavior,
		};

		return behaviors;
	}
}

new Module();
