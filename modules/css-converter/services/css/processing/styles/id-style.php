<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing\Styles;

use Elementor\Modules\CssConverter\Services\Css\Processing\Base_Style;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Id_Style extends Base_Style {
	private $id;
	private $element_id;

	public function __construct( array $data ) {
		parent::__construct( $data );
		$this->id = $data['id'];
		$this->element_id = $data['element_id'];
	}

	public function matches( array $widget ): bool {
		$html_id = $widget['attributes']['id'] ?? null;
		return $html_id && $this->id === $html_id;
	}

	public function get_source(): string {
		return 'id';
	}

	public function get_id(): string {
		return $this->id;
	}

	public function get_element_id(): string {
		return $this->element_id;
	}
}
