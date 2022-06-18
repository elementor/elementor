export class Save extends $e.modules.CommandBase {
	apply() {
		$e.run( 'document/save/draft' );
	}
}

export default Save;

