<?php
namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Map\Providers\Google;

use Elementor\Core\Utils\Hints;
use Elementor\Modules\AtomicWidgets\Controls\Types\Notice_Control;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Map\Map_Provider_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Prop_Duplication_Behavior;
use Elementor\Modules\Components\PropTypes\Overridable_Prop_Type;
use Elementor\Settings;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Google_Maps_Provider extends Map_Provider_Base {
	const KEY = 'google';

	const API_KEY_OPTION = 'elementor_google_maps_api_key';

	const API_KEY_NOTICE_PROP = '_google_api_key_notice';

	const API_KEY_NOTICE_HINT = 'google_maps_api_key_atomic_notice';

	public function get_key(): string {
		return self::KEY;
	}

	public function get_label(): string {
		return esc_html__( 'Google Maps', 'elementor' );
	}

	public function get_templates(): array {
		return [
			'elementor/elements/atomic-map/google' => __DIR__ . '/google-maps.html.twig',
		];
	}

	public function get_external_url( string $location ): string {
		return 'https://maps.google.com/maps?q=' . rawurlencode( $location );
	}

	public function get_template_context(): array {
		return [
			'api_key' => $this->get_api_key(),
		];
	}

	public function get_keywords(): array {
		return [ 'google', 'google maps' ];
	}

	public function define_props_schema(): array {
		return [
			self::API_KEY_NOTICE_PROP => String_Prop_Type::make()
				->default( '' )
				->meta( Overridable_Prop_Type::ignore() )
				->meta( Prop_Duplication_Behavior::clear() ),
		];
	}

	public function define_controls(): array {
		if ( ! $this->should_show_api_key_notice() ) {
			return [];
		}

		return [
			Notice_Control::bind_to( self::API_KEY_NOTICE_PROP )
				->set_notice_type( 'info' )
				->set_heading( esc_html__( 'Connect an API key', 'elementor' ) )
				->set_content( esc_html__( 'Improve map reliability and help ensure maps display correctly.', 'elementor' ) )
				->set_dismissible( self::API_KEY_NOTICE_HINT )
				->set_button_text( esc_html__( 'Set up', 'elementor' ) )
				->set_button_url( Settings::get_settings_tab_url( 'integrations' ) ),
		];
	}

	private function should_show_api_key_notice(): bool {
		return '' === $this->get_api_key() && ! Hints::is_dismissed( self::API_KEY_NOTICE_HINT );
	}

	private function get_api_key(): string {
		return trim( (string) get_option( self::API_KEY_OPTION, '' ) );
	}
}
