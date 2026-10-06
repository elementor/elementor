<?php
namespace Elementor_Example_Plugin\Variables;

use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Shadow_Variable_Prop_Type extends String_Prop_Type {

	public static function get_key(): string {
		return 'global-shadow-variable';
	}
}
