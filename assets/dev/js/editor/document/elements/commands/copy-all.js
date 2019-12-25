import CommandBase from 'elementor-api/modules/command-base';

export class CopyAll extends CommandBase {
	apply() {
		$e.run( 'document/elements/copy', {
			containers: Object.values( elementor.getPreviewView().children._views ).map( ( view ) => view.getContainer() ),
		} );
	}
}

export default CopyAll;
