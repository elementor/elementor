export class StylesUpdate extends $e.modules.CommandBase {
	static getSubTitle() {
		return __( 'Style', 'elementor' );
	}

	validateArgs() {
		return true;
	}

	apply( ) {}
}

export default StylesUpdate;
