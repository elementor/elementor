export const togglePopover = ( type, name, id, controlName ) => {
	window.top.$e.run( 'controls/toggle-control', {
		controlPath: `${ type }_${ name }/${ id }/${ controlName }`,
	} );
};
