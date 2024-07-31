export default class Module extends elementorModules.editor.utils.Module {
	doAjaxRequest = ( action, data ) => {
		try {
			return new Promise( ( resolve, reject ) => {
				elementorCommon.ajax.addRequest( action, {
					data,
					error: () => reject(),
					success: ( res ) => {
						resolve( res );
					},
				} );
			} );
		} catch ( error ) {
			return false;
		}
	};
}
