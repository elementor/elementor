<?php

namespace Elementor\Modules\AtomicWidgets\Elements\Promotions;

use Elementor\Core\Admin\Admin_Notices;
use Elementor\Core\Utils\Hints;
use Elementor\Modules\AtomicWidgets\Controls\Types\Notice_Control;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Prop_Duplication_Behavior;
use Elementor\Modules\Components\PropTypes\Overridable_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

trait Has_Io_Promotion_Notice {
	private static function get_io_notice_hint_key(): string {
		return 'image-optimization';
	}

	private static function get_io_notice_plugin_slug(): string {
		return 'image-optimization';
	}

	private static function get_io_notice_prop_key(): string {
		return '_io_notice';
	}

	private static function get_io_notice_campaign_name(): string {
		return 'elementor_image_optimization_campaign';
	}

	protected static function get_io_promotion_notice_prop_schema(): array {
		return [
			self::get_io_notice_prop_key() => String_Prop_Type::make()
				->default( '' )
				->meta( Overridable_Prop_Type::ignore() )
				->meta( Prop_Duplication_Behavior::clear() ),
		];
	}

	protected function get_io_promotion_notice_control(): ?Notice_Control {
		if ( ! Hints::should_display_hint( self::get_io_notice_hint_key() ) ) {
			return null;
		}

		if ( Hints::is_plugin_active( self::get_io_notice_plugin_slug() ) ) {
			return null;
		}

		$notice_data = $this->get_io_promotion_notice_data();

		return Notice_Control::bind_to( self::get_io_notice_prop_key() )
			->set_notice_type( 'info' )
			->set_content( $notice_data['content'] )
			->set_dismissible( 'image_optimizer_hint' )
			->set_button_text( $notice_data['button_text'] )
			->set_button_url( $notice_data['button_url'] );
	}

	private function get_io_promotion_notice_data(): array {
		$plugin_slug = self::get_io_notice_plugin_slug();
		$one_subscription = Hints::is_plugin_connected_to_one_subscription();
		$is_installed = Hints::is_plugin_installed( $plugin_slug );

		if ( $one_subscription ) {
			return $is_installed
				? [
					'content' => esc_html__( 'Your ONE subscription includes Image Optimization. Activate it to optimize images and improve site performance.', 'elementor' ),
					'button_text' => esc_html__( 'Activate now', 'elementor' ),
					'button_url' => $this->get_io_promotion_notice_url(
						Hints::get_plugin_activate_url( $plugin_slug ),
						'io-plg-atoms-one-activate',
						'editor-atomic-widget-one-activate',
						'editor-one'
					),
				]
				: [
					'content' => esc_html__( 'Optimize your images to improve site speed and performance. Image Optimization is included in your ONE subscription.', 'elementor' ),
					'button_text' => esc_html__( 'Install now', 'elementor' ),
					'button_url' => $this->get_io_promotion_notice_url(
						Hints::get_plugin_install_url( $plugin_slug ),
						'io-plg-atoms-one-install',
						'editor-atomic-widget-one-install',
						'editor-one'
					),
				];
		}

		$content = esc_html__( 'Optimize your images to enhance site performance by using Image Optimization.', 'elementor' );

		return $is_installed
			? [
				'content' => $content,
				'button_text' => esc_html__( 'Activate now', 'elementor' ),
				'button_url' => $this->get_io_promotion_notice_url(
					Hints::get_plugin_activate_url( $plugin_slug ),
					'io-plg-atoms',
					'editor-atomic-widget',
					'editor'
				),
			]
			: [
				'content' => $content,
				'button_text' => esc_html__( 'Install now', 'elementor' ),
				'button_url' => $this->get_io_promotion_notice_url(
					Hints::get_plugin_install_url( $plugin_slug ),
					'io-plg-atoms',
					'editor-atomic-widget',
					'editor'
				),
			];
	}

	private function get_io_promotion_notice_url( string $url, string $campaign, string $source, string $medium ): string {
		$url_with_campaign_data = Admin_Notices::add_plg_campaign_data( $url, [
			'name' => self::get_io_notice_campaign_name(),
			'campaign' => $campaign,
			'source' => $source,
			'medium' => $medium,
		] );

		return Hints::decode_url_for_js( $url_with_campaign_data );
	}
}
