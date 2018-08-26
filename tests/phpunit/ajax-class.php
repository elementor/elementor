<?php
namespace Elementor\Testing;

class Elementor_Test_AJAX extends \WP_Ajax_UnitTestCase {
	use Elementor_Test;

	public function getSelf() {
		return $this;
	}

	public function _handleAjaxAndDecode( $action ) {
		try {
			$this->_handleAjax( $action );
		} catch ( \WPAjaxDieContinueException $e ) {
			unset( $e );
		}

		return json_decode( $this->_last_response, true );
	}
}