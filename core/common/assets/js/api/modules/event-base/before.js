import EventBase from './base';

export default class EventBefore extends EventBase {
	register() {
		$e.events.registerBefore( this );
	}
}
