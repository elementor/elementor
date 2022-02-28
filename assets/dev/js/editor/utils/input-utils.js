export default class UserEvents {
	static isPaste( inputEvent ) {
		const PASTE_EVENT = 'insertFromPaste';
		const KEY_V = 'KeyV';

		const originalEventPaste = PASTE_EVENT === inputEvent.originalEvent.inputType;
		const ctrlPlusV = inputEvent.code === KEY_V && inputEvent.ctrlKey;

		return ( originalEventPaste || ctrlPlusV );
	}
}
