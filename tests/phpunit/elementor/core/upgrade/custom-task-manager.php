<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Upgrade;

use Elementor\Core\Upgrade\Custom_Tasks_Manager;
use Elementor\Tests\Phpunit\Elementor\Core\Upgrade\Mock\Mock_Custom_Tasks;

class Custom_Task_Manager extends Custom_Tasks_Manager {
	public function get_tasks_class() {
		return Mock_Custom_Tasks::class;
	}

	public function public_start_run() {
		$this->start_run();
	}
}
