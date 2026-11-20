<?php
namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Google_Maps;

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Map\Atomic_Map_Base;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Map\Providers\Google\Google_Maps_Provider;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Atomic_Google_Maps extends Atomic_Map_Base {
	public static $widget_description = 'Embeds a Google Map at a specified address and zoom level.';

	public static function get_element_type(): string {
		return 'e-google-maps';
	}

	public static function get_provider_key(): string {
		return Google_Maps_Provider::KEY;
	}

	public function get_title() {
		return esc_html__( 'Google Maps', 'elementor' );
	}

	public function get_icon() {
		return 'eicon-google-maps';
	}
}
