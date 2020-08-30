import CommandBase from 'elementor-api/modules/command-base';

/**
 * @property {RevisionsComponent} component
 */
export class Down extends CommandBase {
	apply() {
		this.component.navigate();
	}
}

export default Down;
