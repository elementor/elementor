<?php
namespace Elementor\Data\Editor\Globals;

class Component {
	private $manager;

	public $commands = [];

	public function __construct( $manager ) {
		$this->manager = $manager;
		$this->register_commands();
	}

	public function get_name() {
		return 'globals';
	}

	protected function register_commands() {
		$this->register_command( '\Elementor\Data\Editor\Globals\Commands\Colors' );
	}

	protected function register_command( $class ) {
		$command_instance = new $class( $this );
		$full_command_name = $this->get_name() . '/' . $command_instance->get_name();

		$this->commands[ $full_command_name ] = $command_instance;
	}
}
