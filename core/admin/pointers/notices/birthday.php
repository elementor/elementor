<?php

namespace Elementor\Core\Admin\Pointers\Notices;

use Elementor\Core\Admin\Pointers\Manager;
use Elementor\Settings;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Birthday {
	const ELEMENTOR_PAGE_ID = Settings::PAGE_ID;
	const ELEMENTOR_POINTER_ID = 'toplevel_page_elementor';
	const LINK_SELECTOR = 'elementor-pointer-settings-link';
	const SLUG = 'elementor-birthday';
	const SEEN_TODAY_KEY = 'elementor-birthday-seen';

	public function __construct() {
		add_action( 'in_admin_header', [ $this, 'enqueue_notice' ] );
	}

	public function enqueue_notice() {
		if ( ! $this->should_display_notice() ) {
			return;
		}

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
						action: "<?php echo esc_attr( Manager::DISMISSED_POINTERS_META_KEY ); ?>".replaceAll( "-", "_" ),
						data: {
							pointer: '<?php echo esc_attr( self::SLUG ); ?>'
						},
						nonce: '<?php echo esc_attr( wp_create_nonce( Manager::DISMISS_ACTION_KEY ) ); ?>'
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

	private function should_display_notice(): bool {
		return $this->is_dashboard_page() &&
			$this->is_user_allowed() &&
			! Manager::is_dismissed( self::SLUG ) &&
			$this->is_campaign_time() &&
			! $this->is_already_seen_toady();
	}

	private function is_dashboard_page(): bool {
		return is_admin() && 'dashboard' === get_current_screen()->id;
	}

	private function is_user_allowed(): bool {
		return current_user_can( 'manage_options' ) || current_user_can( 'edit_pages' );
	}

	private function is_campaign_time() {
		$start = new \DateTime( '2025-06-10 12:00:00', new \DateTimeZone( 'UTC' ) );
		$end = new \DateTime( '2025-06-17 03:59:00', new \DateTimeZone( 'UTC' ) );
		$now = new \DateTime( 'now', new \DateTimeZone( 'UTC' ) );

		return $now >= $start && $now <= $end;
	}

	private function is_already_seen_toady() {
		return get_transient( $this->get_user_transient_id() );
	}

	private function set_seen_today() {
		$now = time();
		$midnight = strtotime( 'tomorrow midnight' );
		$seconds_until_midnight = $midnight - $now;

		set_transient( $this->get_user_transient_id(), $now, $seconds_until_midnight );
	}

	private function get_user_transient_id() {
		return self::SEEN_TODAY_KEY . '_' . get_current_user_id();
	}

	private function enqueue_dependencies() {
		wp_enqueue_script( 'wp-pointer' );
		wp_enqueue_style( 'wp-pointer' );
	}
}
