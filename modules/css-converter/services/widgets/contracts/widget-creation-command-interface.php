<?php
namespace Elementor\Modules\CssConverter\Services\Widgets\Contracts;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Modules\CssConverter\Services\Widgets\Widget_Creation_Context;
use Elementor\Modules\CssConverter\Services\Widgets\Widget_Creation_Result;

interface Widget_Creation_Command_Interface {
	public function execute( Widget_Creation_Context $context ): Widget_Creation_Result;
	public function get_command_name(): string;
}
