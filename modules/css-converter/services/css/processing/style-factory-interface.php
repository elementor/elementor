<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

interface Style_Factory_Interface {
	public function create_styles( array $data ): array;
	public function get_specificity_weight(): int;
}
