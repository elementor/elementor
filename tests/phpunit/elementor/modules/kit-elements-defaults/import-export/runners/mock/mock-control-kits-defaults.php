<?php
namespace Elementor\Testing\Modules\KitElementsDefaults\ImportExport\Runners;

use Elementor\Base_Control;

class Mock_Control_Kits_Defaults extends Base_Control {
	const NAME = 'mock-control-kits-defaults';

	public function get_type() {
		return static::NAME;
	}

	public function content_template() {
		echo '<div></div>';
	}

	public function on_export( $value ) {
		return "{$value} changed on export";
	}

	public function on_import( $value ) {
		return "{$value} changed on import";
	}
}
