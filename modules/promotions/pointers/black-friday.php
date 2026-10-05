<?php

namespace Elementor\Modules\Promotions\Pointers;

use Elementor\Includes\EditorAssetsAPI;
use Elementor\User;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Black_Friday {
	const POINTER_TRANSIENT_KEY = 'elementor_pointer_assets_data';
	const ELEMENTOR_POINTER_ID  = 'toplevel_page_elementor-home';
	const SEEN_TODAY_KEY        = '_elementor_black_friday';
	const DISMISS_ACTION_KEY    = 'black_friday_pointer';

	public function __construct() {
		add_action( 'admin_print_footer_scripts-index.php', [ $this, 'enqueue_notice' ] );
	}

	public function enqueue_notice() {
		if ( ! self::should_display_notice() ) {
			return;
		}

		$assets_data = self::get_pointer_assets_data();

		if ( empty( $assets_data['is_active'] ) ) {
			return;
		}

		if ( self::is_dismissed( $assets_data ) ) {
			return;
		}

		if ( empty( $assets_data['title'] ) || empty( $assets_data['cta_url'] ) ) {
			return;
		}

		$this->set_seen_today();
		$this->enqueue_dependencies();

		$pointer_content  = '<h3>' . esc_html( $assets_data['title'] ) . '</h3>';
		$pointer_content .= '<p>' . esc_html( $assets_data['text'] ?? '' ) . '</p>';
		$pointer_content .= sprintf(
			'<p><a class="button button-primary" href="%s" target="_blank">%s</a></p>',
			esc_url( $assets_data['cta_url'] ),
			esc_html( $assets_data['cta_text'] ?? __( 'View Deals', 'elementor' ) )
		);

		$allowed_tags = [
			'h3' => [],
			'p'  => [],
			'a'  => [
				'class'  => [],
				'target' => [ '_blank' ],
				'href'   => [],
			],
		];
		?>

		<script>
			jQuery( document ).ready( function( $ ) {
				$( "#<?php echo esc_attr( self::ELEMENTOR_POINTER_ID ); ?>" ).pointer( {
					content: <?php echo wp_json_encode( wp_kses( $pointer_content, $allowed_tags ) ); ?>,
					position: {
						edge: <?php echo is_rtl() ? "'right'" : "'left'"; ?>,
						align: "center"
					},
					close: function() {
						elementorCommon.ajax.addRequest( "introduction_viewed", {
							data: {
								introductionKey: '<?php echo esc_attr( self::get_dismiss_action_key( $assets_data ) ); ?>'
							}
						} );
					}
				} ).pointer( "open" );
			} );
		</script>
		<?php
	}

	public static function should_display_notice(): bool {
		return self::is_user_allowed() &&
			! self::is_already_seen_today() &&
			! Utils::has_pro();
	}

	private static function is_user_allowed(): bool {
		return current_user_can( 'manage_options' ) || current_user_can( 'edit_pages' );
	}

	private static function is_already_seen_today() {
		return get_transient( self::get_user_transient_id() );
	}

	private function set_seen_today() {
		$now                    = time();
		$midnight               = strtotime( 'tomorrow midnight' );
		$seconds_until_midnight = $midnight - $now;

		set_transient( self::get_user_transient_id(), $now, $seconds_until_midnight );
	}

	private static function get_user_transient_id(): string {
		return self::SEEN_TODAY_KEY . '_' . get_current_user_id();
	}

	private function enqueue_dependencies() {
		wp_enqueue_script( 'wp-pointer' );
		wp_enqueue_style( 'wp-pointer' );
	}

	private static function is_dismissed( array $assets_data ): bool {
		return (bool) User::get_introduction_meta( self::get_dismiss_action_key( $assets_data ) );
	}

	private static function get_dismiss_action_key( array $assets_data ): string {
		$campaign_id = ! empty( $assets_data['campaign_id'] ) ? sanitize_key( $assets_data['campaign_id'] ) : '';
		return $campaign_id
			? self::DISMISS_ACTION_KEY . '_' . $campaign_id
			: self::DISMISS_ACTION_KEY;
	}

	public static function get_pointer_assets_data(): array {
		$api = new EditorAssetsAPI( [
			EditorAssetsAPI::ASSETS_DATA_TRANSIENT_KEY => self::POINTER_TRANSIENT_KEY,
			EditorAssetsAPI::ASSETS_DATA_URL           => EditorAssetsAPI::PRODUCTION_URL . '/editor-promotions/v1/pointer.json',
			EditorAssetsAPI::ASSETS_DATA_KEY           => 'pointer',
		] );
		return $api->get_assets_data();
	}
}
