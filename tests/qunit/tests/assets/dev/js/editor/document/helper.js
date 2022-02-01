export default class DocumentHelper {
	static testCommands( commands ) {
		Object.values( commands ).forEach( ( reference ) => reference() );
	}
}
