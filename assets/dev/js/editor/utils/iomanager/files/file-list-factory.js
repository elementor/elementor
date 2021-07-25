export default class FileListFactory {
	/**
	 * Since FileList is a read-only object and cannot be instantiated, we use the DataTransfer which allows
	 * us to add items as files, and then get the overall FileList.
	 *
	 * @param files
	 * @returns {FileList}
	 */
	static createFileList( files ) {
		const dataTransfer = new DataTransfer();

		files.map(
			( file ) => dataTransfer.items.add( file )
		);

		return dataTransfer.files;
	}

	/**
	 * Check whether a subject is instance of FileList. Since there's no consistency with the FileList object
	 * returned from a File API action and the FileList object available by JavaScript, the comparison is made
	 * by the objects constructor/prototype names.
	 *
	 * @param subject
	 * @returns {boolean}
	 */
	static isFileList( subject ) {
		return subject.constructor.name === FileList.prototype[ Symbol.toStringTag ];
	}
}
