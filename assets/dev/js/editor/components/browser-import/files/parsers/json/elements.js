import FileParserBase from '../../file-parser-base';
import ContainerFactory from '../../../container-factory';

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
		return ( await this.reader.getData() ).content.map(
			( element ) => ContainerFactory.createElementContainer( element ),
		);
	}

	/**
	 * @inheritDoc
	 */
	static async validate( reader ) {
		const data = await reader.getData();

		return data.version && data.type &&
			Array.isArray( data.content );
	}
}
