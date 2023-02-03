export class CopyAll extends $e.modules.CommandBase {
	apply() {
		$e.run( 'document/elements/copy', {
			containers: Object.values( elementor.getPreviewView().children._views ).map( ( view ) => view.getContainer() ),
		} );
	}
}

export default CopyAll;
