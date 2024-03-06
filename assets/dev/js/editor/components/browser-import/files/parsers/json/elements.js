import FileParserBase from '../../file-parser-base';
import ContainerFactory from '../../../container-factory';
import FilesUploadHandler from '../../../../../utils/files-upload-handler';

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
		if ( ! elementorCommon.config.filesUpload.unfilteredFiles ) {
			return new Promise( ( resolve ) => {
				const enableUnfilteredDialog = FilesUploadHandler.getUnfilteredFilesNotEnabledImportTemplateDialog( async () => {
					const result = await this.validateData( reader );
					resolve( result );
				} );

				enableUnfilteredDialog.show();
			} );
		}

		return await this.validateData( reader );
	}

	static async validateData( reader ) {
		const data = await reader.getData();

		return data.version && data.type &&
			Array.isArray( data.content );
	}
}
