<?php
namespace Elementor\Testing;

class Elementor_Test_AJAX extends \WP_Ajax_UnitTestCase {
	use Elementor_Test;

	public function getSelf() {
		return $this;
	}
}