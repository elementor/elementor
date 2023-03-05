import { goToRoute } from "../../../../../assets/js/common/utils/web-cli";

export const togglePopover = ( name, type, id, show ) => {
	const endpoint = show ? 'show' : 'hide';
	goToRoute( `panel/global/global-${ name }/picker/${ endpoint }`, {
		type, id
	} );
};