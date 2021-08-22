export default class Session {
	/**
	 * The Manager instance.
	 *
	 * @type {Manager}
	 */
	manager;

	/**
	 * The FileCollection instance.
	 *
	 * @type {FileCollection}
	 */
	fileCollection;

	/**
	 * The Target instance.
	 *
	 * @type {Target}
	 */
	container;

	/**
	 * The Session options.
	 *
	 * @type {{}}
	 */
	options = {};

	/**
	 * Session constructor.
	 *
	 * @param manager
	 * @param fileCollection
	 * @param container
	 * @param options
	 */
	constructor( manager, fileCollection = null, container = null, options = {} ) {
		this.manager = manager;
		this.fileCollection = fileCollection;
		this.container = container;
		this.options = options;
	}

	/**
	 * Validate all files in this session can be handled.
	 *
	 * @returns {boolean}
	 */
	async validate() {
		for ( const file of this.fileCollection.getFiles() ) {
			if ( ! await this.manager.getReaderOf( file ) ) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Match files to a suitable reader and parser, and handle them.
	 */
	async apply() {
		const result = [];

		for ( const file of this.fileCollection.getFiles() ) {
			const reader = await this.manager.getReaderOf( file );

			if ( reader ) {
				const readerInstance = new reader( file ),
					parser = await this.manager.getParserOf( readerInstance );

				if ( parser ) {
					result.push(
						new parser( readerInstance ).parse()
					);

					continue;
				}
			}

			throw new Error( 'An error occurred when trying to parse the input' );
		}

		return result;
	}
}
