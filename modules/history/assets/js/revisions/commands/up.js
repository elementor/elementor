import CommandBase from 'elementor-api/modules/command-base';

/**
 * @property {RevisionsComponent} component
 */
export class Up extends CommandBase {
	apply() {
		this.component.navigate( true );
	}
}

export default Up;
