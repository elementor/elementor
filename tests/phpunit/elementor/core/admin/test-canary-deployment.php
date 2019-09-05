<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Admin;

use Elementor\Plugin;
use Elementor\Testing\Elementor_Test_Base;

class Test_Canary_Deployment extends Elementor_Test_Base {

	use Test_Canary_Deployment_Trait;

	const CURRENT_VERSION = ELEMENTOR_VERSION;
	const PLUGIN_BASE = ELEMENTOR_PLUGIN_BASE;
	const PLUGIN_FILE = ELEMENTOR__FILE__;
	const CANARY_DEPLOYMENT_CLASS = 'Elementor\Core\Admin\Canary_Deployment';
	const TRANSIENT_KEY_PREFIX = 'elementor_remote_info_api_data_';

	public function setUp() {
		parent::setUp();

		// Create an instance if not exist. (on test only this class).
		Plugin::instance();
	}
}
