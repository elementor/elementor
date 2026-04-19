<?php
namespace Elementor\Modules\AtomicWidgets\Elements\Div_Block;

use Elementor\Modules\AtomicWidgets\Elements\Base\Has_Element_Template;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Div_Block_Twig extends Div_Block {
	use Has_Element_Template;

	protected function get_templates(): array {
		return [
			'elementor/elements/div-block' => __DIR__ . '/div-block.html.twig',
		];
	}
}
