<?php
namespace Elementor\Modules\CssConverter\Services\Widgets;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Include required dependencies

use Elementor\Modules\CssConverter\Services\Widgets\Contracts\Widget_Creation_Command_Interface;

class Widget_Creation_Command_Pipeline {
	private array $commands = [];

	public function add_command( Widget_Creation_Command_Interface $command ): self {
		$this->commands[] = $command;
		return $this;
	}

	public function execute( Widget_Creation_Context $context ): Widget_Creation_Result {
		foreach ( $this->commands as $command ) {
			try {
				$result = $command->execute( $context );

				if ( $result->is_failure() ) {
					return Widget_Creation_Result::failure(
						"Command '{$command->get_command_name()}' failed: {$result->get_error_message()}"
					);
				}
			} catch ( \Exception $e ) {
				return Widget_Creation_Result::failure(
					"Command '{$command->get_command_name()}' threw exception: {$e->getMessage()}"
				);
			}
		}

		return Widget_Creation_Result::success();
	}

	public function get_commands(): array {
		return $this->commands;
	}

	public function clear_commands(): void {
		$this->commands = [];
	}
}
