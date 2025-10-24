<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing\Contracts;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

interface Css_Processor_Interface {

	public function get_processor_name(): string;

	public function get_priority(): int;

	public function process( Css_Processing_Context $context ): Css_Processing_Context;

	public function supports_context( Css_Processing_Context $context ): bool;

	public function get_statistics_keys(): array;
}
