import Container from '../../../editor/container/container';
import PanelElementsElementModel from 'elementor-panel/pages/elements/models/element';

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
	 * @type {Container}
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
	 * Handle files with a suitable file-parser.
	 *
	 * @returns {Container[]}
	 */
	async apply() {
		const parsed = [];

		for ( const file of this.fileCollection.getFiles() ) {
			const parser = await this.manager.getParserOf( file, { instantiate: true } );

			if ( parser ) {
				parsed.push(
					parser.parse()
				);
			} else {
				throw new Error( 'An error occurred when trying to parse the input' );
			}
		}

		return Promise.all( parsed )
			.then( ( result ) => this.containerize( result.flat() ) );
	}

	containerize( elements ) {
		return elements.map( ( element ) => {
			switch ( element.type ) {
				case 'element':
				case 'widget':
					return this.container.view.createElementFromContainer(
						element,
						Object.assign( this.options.container, {
							event: this.options.event,
						} )
					);
			}
		} );
	}
}
