export default class ContainerHelper {
	static isAllAliveRecursive( container ) {
		if ( container.view?.isDestroyed ) {
			return false;
		}

		if ( container.children.length ) {
			for ( const childContainer of container.children ) {
				// TODO - Remove with the backward compatibility. of `container.repeaters[ repeaterName ].children`.
				// Backwards Compatibility: if there is only one repeater (type=repeater), set it's children as current children.
				if ( childContainer.isChildrenBC ) {
					return true;
				}

				if ( ! ContainerHelper.isAllAliveRecursive( childContainer ) ) {
					return false;
				}
			}
		}

		return true;
	}
}
