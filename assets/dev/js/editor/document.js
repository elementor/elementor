import HistoryManager from 'elementor/modules/history/assets/js/history/manager';
import RevisionsManager from 'elementor/modules/history/assets/js/revisions/manager';

/**
 * TODO: Wrong class name + location, conflict with 'editor.js'.
 */
class Editor {
	/**
	 * Editor status.
	 *
	 * @type {'open'|'closed'}
	 */
	status = 'closed';

	/**
	 * Is document still saving?.
	 *
	 * @type {boolean}
	 */
	isSaving = false;

	/**
	 * Is document changed?.
	 *
	 * @type {boolean}
	 */
	isChanged = false;

	/**
	 * Is document changed during save?.
	 *
	 * @type {boolean}
	 */
	isChangedDuringSave = false;

	/**
	 * Is document saved?
	 *
	 * @type {boolean}
	 */
	isSaved = true;

	/**
	 * Last save history id.
	 *
	 * @type {number}
	 */
	lastSaveHistoryId = 0;
}

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

		this.history = new HistoryManager( this );
		this.revisions = new RevisionsManager( this );
	}

	isDraft() {
		return this.config.revisions.current_id !== this.config.id;
	}
}
