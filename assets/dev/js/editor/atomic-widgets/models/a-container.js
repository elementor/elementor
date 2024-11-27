import { default as ElementModel } from '../../elements/models/element';

export default class AtomicContainer extends ElementModel {
	/**
	 * Do not allow section or column be placed in the container.
	 */
	isValidChild() {
		return true;
	}
}
