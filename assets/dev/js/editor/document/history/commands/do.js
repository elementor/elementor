import Command from 'elementor-api/modules/command';

export class Do extends Command {
	apply( args ) {
		const { index } = args;

		return elementor.documents.getCurrent().history.doItem( index );
	}
}

export default Do;
