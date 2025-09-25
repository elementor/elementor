<?php
namespace Elementor\Testing\Modules\CssConverter;

use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group css-converter
 */
class Test_Variables_Mapping extends Elementor_Test_Base {

	public function test_upserts_variables_into_repository() {
		$this->markTestSkipped( 'Variable repository integration not implemented in MVP yet.' );
	}
}


