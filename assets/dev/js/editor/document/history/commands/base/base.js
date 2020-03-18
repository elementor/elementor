import CommandInternal from 'elementor-api/modules/command-internal';

export default class Base extends CommandInternal {
	initialize( args ) {
		super.initialize( args );

		/**
		 * @type {HistoryManager}
		 */
		this.history = elementor.documents.getCurrent().history;
	}
}
