import CommandNavigatorArrows from './base/command-navigator-arrows';

export class Up extends CommandNavigatorArrows {
	apply() {
		this.constructor.prev();
	}
}

export default Up;
