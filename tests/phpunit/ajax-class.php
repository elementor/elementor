<?php
namespace Elementor\Testing;

use Elementor\Testing\Traits\Kit_Trait;
use Elementor\Testing\Traits\Base_Elementor;
use Elementor\Testing\Traits\Extra_Assertions;

class Elementor_Test_AJAX extends \WP_Ajax_UnitTestCase {
	use Base_Elementor, Extra_Assertions, Kit_Trait;

	public function setUp() {
		parent::setUp();

		$this->create_default_kit();
	}

	public function define_doing_ajax() {
		if ( ! wp_doing_ajax() ) {
			define( 'DOING_AJAX', true );
		}
	}

	public function _handleAjaxAndDecode( $action ) {
		try {
			$this->_handleAjax( $action );
		} catch ( \WPAjaxDieContinueException $e ) {
			unset( $e );
		} catch ( \WPAjaxDieStopException $e ) {
			// Do nothing.
		}

		return json_decode( $this->_last_response, true );
	}
}
