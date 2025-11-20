<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing\Styles;

use Elementor\Modules\CssConverter\Services\Css\Processing\Base_Style;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Complex_Reset_Style extends Base_Style {
	private $selector;
	private $element_id;

	public function __construct( array $data ) {
		parent::__construct( $data );
		$this->selector = $data['selector'];
		$this->element_id = $data['element_id'];
	}

	public function matches( array $widget ): bool {
		$widget_element_id = $widget['element_id'] ?? null;
		return $this->element_id === $widget_element_id;
	}

	public function get_source(): string {
		return 'complex-reset';
	}

	public function get_selector(): string {
		return $this->selector;
	}

	public function get_element_id(): string {
		return $this->element_id;
	}
}
