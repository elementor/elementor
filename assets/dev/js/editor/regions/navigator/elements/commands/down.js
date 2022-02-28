import CommandNavigatorArrows from './base/command-navigator-arrows';

export class Down extends CommandNavigatorArrows {
	apply() {
		this.constructor.next();
	}
}

export default Down;
