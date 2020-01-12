import CommandBase from 'elementor-api/modules/command-base';

export default class Base extends CommandBase {
	initialize( args ) {
		super.initialize( args );

		/**
		 * @type {HistoryManager}
		 */
		this.history = elementor.documents.getCurrent().history;
	}
}
