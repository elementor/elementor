import { getElementChildren } from '../../../utils/get-element-children';
import { BaseDuplicatedStylesDetection } from './base-duplicated-styles-detection';

export class DuplicateElementHook extends BaseDuplicatedStylesDetection {
	getCommand() {
		return 'document/elements/duplicate';
	}

	apply( args ) {
		const { containers = [ args.container ] } = args;

		containers.forEach( ( duplicatedElement ) => {
			const container = duplicatedElement.parent;

			const nextSiblings = container.children.slice( duplicatedElement.view._index + 1 );

			const allElements = nextSiblings.flatMap( ( child ) => getElementChildren( child.lookup() ) );

			const styledElements = allElements.filter( Boolean ).reduce( this.getDuplicatedStyledElements, [] );

			styledElements?.forEach( this.updateStyle );
		} );

		this.notifyStyleUpdate();
	}
}
export default DuplicateElementHook;
