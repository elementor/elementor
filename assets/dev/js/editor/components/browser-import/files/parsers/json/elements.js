import FileParserBase from '../../file-parser-base';

export class Elements extends FileParserBase {
	/**
	 * @inheritDoc
	 */
	static getName() {
		return 'elements';
	}

	/**
	 * @inheritDoc
	 */
	static getReaders() {
		return [ 'json' ];
	}

	/**
	 * @inheritDoc
	 */
	async parse() {
		const data = await this.reader.getData();

		for ( const element of data.elements ) {
			this.session.getTarget()
				.createElement( element.type, element.options );
		}
	}

	/**
	 * @inheritDoc
	 */
	static async validate( reader ) {
		const data = await reader.getData();

		return 1 === Object.keys( data ).length &&
			Array.isArray( data.elements );
	}
}
