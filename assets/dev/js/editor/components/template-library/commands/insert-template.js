import CommandBase from 'elementor-api/modules/command-base';

export class InsertTemplate extends CommandBase {
	apply( args ) {
		return this.component.insertTemplate( args );
	}
}

export default InsertTemplate;
