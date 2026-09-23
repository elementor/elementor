<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Checklist;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\Checklist\Module;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Module extends Elementor_Test_Base {

	public function test_experiment_is_hidden_and_inactive_by_default(): void {
		$experiment = Module::get_experimental_data();

		$this->assertSame( Module::EXPERIMENT_NAME, $experiment['name'] );
		$this->assertTrue( $experiment['hidden'] );
		$this->assertSame( Experiments_Manager::STATE_INACTIVE, $experiment['default'] );
		$this->assertSame( Experiments_Manager::RELEASE_STATUS_STABLE, $experiment['release_status'] );
	}
}
