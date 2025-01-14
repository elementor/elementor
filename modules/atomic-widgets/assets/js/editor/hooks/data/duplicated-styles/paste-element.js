import { getElementChildren } from '../../../utils/get-element-children';
import { BaseDuplicatedStylesDetection } from './base-duplicated-styles-detection';

export class PasteElementHook extends BaseDuplicatedStylesDetection {
	getCommand() {
		return 'document/elements/paste';
	}

	apply( args ) {
		const { containers = [ args.container ] } = args;

		containers.forEach( ( container ) => {
			const allElements = getElementChildren( container.lookup() );

			const styledElements = allElements.filter( Boolean ).reduce( this.getDuplicatedStyledElements, [] );

			styledElements?.forEach( this.updateStyle );
		} );

		this.notifyStyleUpdate();
	}
}
export default PasteElementHook;
