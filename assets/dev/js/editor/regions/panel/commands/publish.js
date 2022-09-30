export class Publish extends $e.modules.CommandBase {
	apply() {
		$e.run( 'document/save/publish' );
	}
}

export default Publish;

