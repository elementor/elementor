<?php
namespace Elementor\Testing;

use Elementor\Plugin;
use Elementor\Testing\Traits\Base_Elementor;
use Elementor\Testing\Traits\Extra_Assertions;

class Elementor_Test_Base extends \WP_UnitTestCase {
	use Base_Elementor, Extra_Assertions;

	public function tearDown() {
		parent::tearDown();

		Plugin::$instance->documents->restore_document();
		Plugin::$instance->editor->set_edit_mode( false );
	}
}
