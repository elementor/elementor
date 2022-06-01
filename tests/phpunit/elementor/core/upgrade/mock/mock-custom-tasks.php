<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Upgrade\Mock;

class Mock_Custom_Tasks {
	static function test_task_set_global() {
		$GLOBALS[ self::class ] = true;
	}
}
