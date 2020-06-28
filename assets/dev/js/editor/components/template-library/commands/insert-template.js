import Command from 'elementor-api/modules/command';

export class InsertTemplate extends Command {
	apply( args ) {
		return this.component.insertTemplate( args );
	}
}

export default InsertTemplate;
