import HistoryManager from '../../../../../modules/history/assets/js/history/manager';
import RevisionsManager from '../../../../../modules/history/assets/js/revisions/manager';

export default class Document {
	/**
	 * Document id.
	 *
	 * @type {number|null}
	 */
	id = null;

	/**
	 * History of the document.
	 *
	 * @type {HistoryManager}
	 */
	history = null;

	/**
	 * Revisions of the document.
	 *
	 * @type {RevisionsManager}
	 */
	revisions = null;

	/**
	 * Function constructor().
	 *
	 * Create document.
	 *
	 * @param {number} id
	 */
	constructor( id ) {
		this.id = id;

		this.initialize();
	}

	/**
	 * Function initialize().
	 *
	 * Initialize document.
	 */
	initialize() {
		this.history = new HistoryManager();
		this.revisions = new RevisionsManager( this );
	}
}
