<?php

namespace Elementor\Core\Admin\PointerNotices;

use Elementor\Settings;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Birthday {
	const ELEMENTOR_PAGE_ID = Settings::PAGE_ID;
	const ELEMENTOR_POINTER_ID = 'toplevel_page_elementor';
	const LINK_SELECTOR = 'elementor-pointer-settings-link';
	const SEEN_TODAY_KEY = 'elementor-birthday-seen';
	const DISMISS_ACTION_KEY = 'elementor-birthday-dismissed-pointer';

	public function __construct() {
		$this->register_notice();
		$this->register_dismiss_action();
	}

	private function register_notice() {
		add_action( 'in_admin_header', [ $this, 'enqueue_notice' ] );
	}

	private function register_dismiss_action() {
		add_action( 'wp_ajax_' . self::DISMISS_ACTION_KEY, [ $this, 'dismiss_pointers' ] );
	}

	public function enqueue_notice() {
		$this->set_seen_today();
		$this->enqueue_dependencies();

		$pointer_content = '<h3>' . esc_html__( 'Elementor’s 9th Birthday sale!', 'elementor' ) . '</h3>';
		$pointer_content .= '<p>' . esc_html__( 'Celebrate Elementor’s birthday with us—exclusive deals are available now.', 'elementor' );
		$pointer_content .= sprintf(
			'<p><a class="button button-primary ' . self::LINK_SELECTOR . '" href="%s">%s</a></p>',
			admin_url( 'admin.php?page=' . self::ELEMENTOR_PAGE_ID ),
			esc_html__( 'View Deals', 'elementor' )
		);

		$allowed_tags = [
			'h3' => [],
			'p' => [],
			'a' => [
				'class' => [],
				'href' => [],
			],
		];
		?>

		<script>
			const onClose = () => {
				return jQuery.ajax( {
					url: ajaxurl,
					method: "POST",
					data: {
						action: "<?php echo esc_attr( self::DISMISS_ACTION_KEY ); ?>".replaceAll( "-", "_" ),
						data: {
							pointer: '<?php echo esc_attr( self::DISMISS_ACTION_KEY ); ?>'
						},
						nonce: '<?php echo esc_attr( wp_create_nonce( self::DISMISS_ACTION_KEY ) ); ?>'
					}
				} );
			};

			jQuery( document ).ready( function( $ ) {
				$( "#<?php echo esc_attr( self::ELEMENTOR_POINTER_ID ); ?>" ).pointer( {
					content: '<?php echo wp_kses( $pointer_content, $allowed_tags ); ?>',
					position: {
						edge: <?php echo is_rtl() ? "'right'" : "'left'"; ?>,
						align: "center"
					},
					close: onClose
				} ).pointer( "open" );

				$( ".<?php echo esc_attr( self::LINK_SELECTOR ); ?>" ).first().on( "click", function( e ) {
					e.preventDefault();

					$( this ).attr( "disabled", true );

					onClose().promise().done( () => {
						location = $( this ).attr( "href" );
					} );
				} );
			} );
		</script>
		<?php
	}

	public static function should_display_notice(): bool {
		return self::is_dashboard_page() &&
			self::is_user_allowed() &&
			! self::is_dismissed() &&
			self::is_campaign_time() &&
			! self::is_already_seen_toady();
	}

	protected static function is_dashboard_page(): bool {
		return is_admin() && 'dashboard' === get_current_screen()->id;
	}

	protected static function is_user_allowed(): bool {
		return current_user_can( 'manage_options' ) || current_user_can( 'edit_pages' );
	}

	protected static function is_campaign_time() {
		$start = new \DateTime( '2025-06-10 12:00:00', new \DateTimeZone( 'UTC' ) );
		$end = new \DateTime( '2025-06-17 03:59:00', new \DateTimeZone( 'UTC' ) );
		$now = new \DateTime( 'now', new \DateTimeZone( 'UTC' ) );

		return $now >= $start && $now <= $end;
	}

	protected static function is_already_seen_toady() {
		return get_transient( self::get_user_transient_id() );
	}

	protected function set_seen_today() {
		$now = time();
		$midnight = strtotime( 'tomorrow midnight' );
		$seconds_until_midnight = $midnight - $now;

		set_transient( self::get_user_transient_id(), $now, $seconds_until_midnight );
	}

	private static function get_user_transient_id() {
		return self::SEEN_TODAY_KEY . '_' . get_current_user_id();
	}

	private function enqueue_dependencies() {
		wp_enqueue_script( 'wp-pointer' );
		wp_enqueue_style( 'wp-pointer' );
	}

	public function dismiss_pointers() {
		if ( ! wp_verify_nonce( Utils::get_super_global_value( $_POST, 'nonce' ), self::DISMISS_ACTION_KEY ) ) {
			return wp_send_json_error( [ 'message' => 'Invalid nonce' ] );
		}

		$data = Utils::get_super_global_value( wp_unslash( $_POST ), 'data' );
		$pointer = isset( $data['pointer'] ) ? $data['pointer'] : null;

		if ( ! $pointer ) {
			wp_send_json_error( [ 'message' => 'The pointer id must be provided' ] );
		}

		update_user_meta( get_current_user_id(), self::DISMISS_ACTION_KEY, true );
		wp_send_json_success( [] );
	}

	public static function is_dismissed(): bool {
		return (bool) get_user_meta( get_current_user_id(), self::DISMISS_ACTION_KEY, true );
	}
}
