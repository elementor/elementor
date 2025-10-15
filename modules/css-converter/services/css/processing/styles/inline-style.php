<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing\Styles;

use Elementor\Modules\CssConverter\Services\Css\Processing\Base_Style;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Inline_Style extends Base_Style {
	private $element_id;

	public function __construct( array $data ) {
		parent::__construct( $data );
		$this->element_id = $data['element_id'];
	}

	public function matches( array $widget ): bool {
		$widget_element_id = $widget['element_id'] ?? null;
		return $this->element_id === $widget_element_id;
	}

	public function get_source(): string {
		return 'inline';
	}

	public function get_element_id(): string {
		return $this->element_id;
	}
}



