<?php

namespace Elementor\Modules\AtomicWidgets\ImportExport\Modifiers;

use Elementor\Modules\AtomicWidgets\PropsResolver\Import_Export_Props_Resolver;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Replace_Style_Ids {

	public static function make() {
		return new self();
	}

	public function run( array $element ) {
		$element = $this->replace_style_ids( $element );
		$element = $this->replace_style_references( $element );

		return $element;
	}

	private function replace_style_ids( array $element ) {

	}
}
