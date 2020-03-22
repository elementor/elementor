<?php

namespace Elementor\Data\Base;

abstract class Component {
	private $manager;

	public function __construct( $manager ) {
		$this->manager = $manager;
		$this->register_commands();
	}

	abstract protected function get_name();

	abstract protected function register_commands();

	protected function register_command( $class ) {
		$command_instance = new $class( $this );
		$full_command_name = $this->get_name() . '/' . $command_instance->get_name();

		$this->commands[ $full_command_name ] = $command_instance;
	}
}
