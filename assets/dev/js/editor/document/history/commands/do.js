import CommandBase from 'elementor-api/modules/command-base';

export class Do extends CommandBase {
	apply( args ) {
		const { index } = args;

		return elementor.documents.getCurrent().history.doItem( index );
	}
}

export default Do;
