import HistoryManager from 'elementor-modules/history/assets/js/history/manager';
import RevisionsManager from 'elementor-modules/history/assets/js/revisions/manager';

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
	 * Current container.
	 *
	 * @type {Container}
	 */
	container = null;

	/**
	 * Editor status.
	 *
	 * @type {'open'|'closed'}
	 */
	editorStatus;

	/**
	 * Function constructor().
	 *
	 * Create document.
	 *
	 * @param {{}} config
	 * @param {Container} container
	 */
	constructor( config, container ) {
		this.config = config;
		this.id = config.id;
		this.container = container;

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
