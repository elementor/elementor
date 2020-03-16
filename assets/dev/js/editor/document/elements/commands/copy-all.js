import CommandHookable from 'elementor-api/modules/command-hookable';

export class CopyAll extends CommandHookable {
	apply() {
		$e.run( 'document/elements/copy', {
			containers: Object.values( elementor.getPreviewView().children._views ).map( ( view ) => view.getContainer() ),
		} );
	}
}

export default CopyAll;
