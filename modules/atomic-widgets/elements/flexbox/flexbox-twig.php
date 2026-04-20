<?php
namespace Elementor\Modules\AtomicWidgets\Elements\Flexbox;

use Elementor\Modules\AtomicWidgets\Elements\Base\Has_Element_Template;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Flexbox_Twig extends Flexbox {
	use Has_Element_Template;

	protected function get_templates(): array {
		return [
			'elementor/elements/flexbox' => __DIR__ . '/flexbox.html.twig',
		];
	}
}
