import CommandInternalBase from 'elementor-api/modules/command-internal-base';

export default class Base extends CommandInternalBase {
	initialize( args ) {
		super.initialize( args );

		/**
		 * @type {HistoryManager}
		 */
		this.history = elementor.documents.getCurrent().history;
	}
}
