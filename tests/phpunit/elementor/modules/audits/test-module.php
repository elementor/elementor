<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Audits;

use Elementor\Modules\Audits\Module;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Module extends TestCase {

	public function test_module_name_is_audits() {
		// Arrange / Act.
		$module = Module::instance();

		// Assert.
		$this->assertSame( 'audits', $module->get_name() );
	}
}
