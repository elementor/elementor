export const parseXml = ( xml: string ): Document =>
	new DOMParser().parseFromString( `<root>${ xml }</root>`, 'application/xml' );
