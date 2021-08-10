import FileParser from '../../file-parser';

export class Widget extends FileParser {
	/**
	 * @inheritDoc
	 */
	static getName() {
		return 'widget';
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
