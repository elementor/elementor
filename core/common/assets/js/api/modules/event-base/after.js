import EventBase from './base';

export default class EventAfter extends EventBase {
	register() {
		$e.events.registerAfter( this );
	}
}
