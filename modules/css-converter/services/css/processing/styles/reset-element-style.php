<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing\Styles;

use Elementor\Modules\CssConverter\Services\Css\Processing\Base_Style;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Reset_Element_Style extends Base_Style {
	private $element_type;

	public function __construct( array $data ) {
		parent::__construct( $data );
		$this->element_type = $data['element_type'];
	}

	public function matches( array $widget ): bool {
		$widget_element_type = $widget['tag'] ?? $widget['widget_type'] ?? 'unknown';
		return $this->element_type === $widget_element_type;
	}

	public function get_source(): string {
		return 'reset-element';
	}

	public function get_element_type(): string {
		return $this->element_type;
	}
}



