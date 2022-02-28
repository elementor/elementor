export default class UserEvents {
	static isPaste( event ) {
		const PASTE_EVENT = 'insertFromPaste';
		const KEY_V = 'KeyV';

		const originalEventPaste = PASTE_EVENT === event.originalEvent.inputType;
		const ctrlPlusV = event.code === KEY_V && event.ctrlKey;

		return ( originalEventPaste || ctrlPlusV );
	}
}
