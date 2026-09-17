export const downloadBlob = ( blob: Blob, fileName: string ): void => {
	const url = URL.createObjectURL( blob );
	const anchor = document.createElement( 'a' );

	anchor.href = url;
	anchor.download = fileName;
	anchor.rel = 'noopener';
	document.body.appendChild( anchor );
	anchor.click();
	document.body.removeChild( anchor );

	URL.revokeObjectURL( url );
};
