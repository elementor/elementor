<?php

namespace Elementor\Modules\ConversionCenter\Widgets;

use Elementor\Modules\ConversionCenter\Classes\Render\Core_Render;
use Elementor\Modules\ConversionCenter\Classes\Render\Icons_Below_Cta_Render;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}


class Link_In_Bio_Var_1 extends Link_In_Bio {
	public function get_name(): string {
		return 'link-in-bio-var-1';
	}

	public function get_title(): string {
		return esc_html__( 'Link In Bio Variation 1', 'elementor' );
	}

	protected function render(): void {
		$render_strategy = new Icons_Below_Cta_Render( $this );

		$render_strategy->render();
	}

}
