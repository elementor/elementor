export default class ContainerHelper {
	static isAllConnectedRecursive( container ) {
		if ( ! container.view.el.isConnected ) {
			return false;
		}

		if ( container.children.length ) {
			for ( const childContainer of container.children ) {
				if ( ! ContainerHelper.isAllConnectedRecursive( childContainer ) ) {
					return false;
				}
			}
		}

		return true;
	}
}
