import FileParserBase from '../../file-parser-base';
import ContainerFactory from 'elementor-editor/components/browser-import/container-factory';

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
		return ( await this.reader.getData() ).elements.map(
			( element ) => ContainerFactory.createElementContainer( element )
		);
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
