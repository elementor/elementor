import Command from 'elementor-api/modules/command';

export class CopyAll extends Command {
	apply() {
		$e.run( 'document/elements/copy', {
			containers: Object.values( elementor.getPreviewView().children._views ).map( ( view ) => view.getContainer() ),
		} );
	}
}

export default CopyAll;
