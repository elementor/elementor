<?php
namespace Elementor\Data\Editor\Globals;

use Elementor\Data\Base\Component as Component_Base;

class Component extends Component_Base {
	public $commands = [];

	public function get_name() {
		return 'globals';
	}

	protected function register_commands() {
		$this->register_command( '\Elementor\Data\Editor\Globals\Commands\Colors' );
		$this->register_command( '\Elementor\Data\Editor\Globals\Commands\Test' );
	}
}
