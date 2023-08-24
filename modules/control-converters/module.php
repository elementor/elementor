<?php
namespace Elementor\Modules\ControlConverters;

use Elementor\Modules\ControlConverters\Slider_To_Gaps_Converter as Slider_To_Gaps_Converter;
use Elementor\Modules\ControlConverters\Command as Command;


if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module {

	private $command;

	public function set_command( Command $command ) {
		$this->command = $command;
	}

	public function execute_command( $element ) {
		return $this->command->execute( $element );
	}
}
