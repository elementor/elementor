import BaseCommand from 'elementor-document/commands/base/base';

export default class Base extends BaseCommand {
	initialize( args ) {
		super.initialize( args );

		/**
		 * @type {HistoryManager}
		 */
		this.history = elementor.documents.getCurrent().history;
	}
}
