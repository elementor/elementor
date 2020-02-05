import HistoryModule from './document/history/module';
import RevisionsManager from 'elementor/modules/history/assets/js/revisions/manager';
import Editor from './model/editor';

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
	 * @type {HistoryModule}
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
	 * Editor Settings.
	 *
	 * @type {Editor}
	 */
	editor = new Editor();

	/**
	 * Function constructor().
	 *
	 * Create document.
	 *
	 * @param {{}} config
	 */
	constructor( config ) {
		this.config = config;
		this.id = config.id;

		this.initialize();
	}

	isDraft() {
		return this.config.revisions.current_id !== this.config.id;
	}

	/**
	 * Function initialize().
	 *
	 * Initialize document.
	 */
	initialize() {
		this.history = new HistoryModule( this );
		this.revisions = new RevisionsManager( this );
	}
}
