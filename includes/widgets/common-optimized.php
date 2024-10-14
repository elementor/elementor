<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Widget_Common_Optimized extends Widget_Common_Base {

	const WRAPPER_SELECTOR = '{{WRAPPER}}';
	const WRAPPER_SELECTOR_CHILD = '{{WRAPPER}}';
	const WRAPPER_SELECTOR_HOVER = '{{WRAPPER}}:hover';
	const WRAPPER_SELECTOR_HOVER_CHILD = '{{WRAPPER}}:hover';
	const MASK_SELECTOR_DEFAULT = '{{WRAPPER}}:not( .elementor-widget-image )';
	const MASK_SELECTOR_IMG = '{{WRAPPER}}.elementor-widget-image img';
	const TRANSFORM_SELECTOR_CLASS = '';

	public function get_name() {
		return 'common-optimized';
	}
}
