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

trait Has_Ally_Promotion_Notice {
	private static function get_ally_notice_hint_key(): string {
		return 'ally_atomic_notice';
	}

	private static function get_ally_notice_plugin_slug(): string {
		return 'pojo-accessibility';
	}

	private static function get_ally_notice_prop_key(): string {
		return '_ally_notice';
	}

	private static function get_ally_notice_campaign_name(): string {
		return 'elementor_ea11y_campaign';
	}

	protected static function get_ally_promotion_notice_prop_schema(): array {
		return [
			self::get_ally_notice_prop_key() => String_Prop_Type::make()
				->default( '' )
				->meta( Overridable_Prop_Type::ignore() )
				->meta( Prop_Duplication_Behavior::clear() ),
		];
	}

	protected function get_ally_promotion_notice_control(): ?Notice_Control {
		if ( ! Hints::should_display_hint( self::get_ally_notice_hint_key() ) ) {
			return null;
		}

		if ( Hints::is_plugin_active( self::get_ally_notice_plugin_slug() ) ) {
			return null;
		}

		$notice_data = $this->get_ally_promotion_notice_data();

		return Notice_Control::bind_to( self::get_ally_notice_prop_key() )
			->set_notice_type( 'info' )
			->set_heading( esc_html__( 'Accessible structure matters', 'elementor' ) )
			->set_content( $notice_data['content'] )
			->set_dismissible( self::get_ally_notice_hint_key() )
			->set_button_text( $notice_data['button_text'] )
			->set_button_url( $notice_data['button_url'] );
	}

	private function get_ally_promotion_notice_data(): array {
		$plugin_slug = self::get_ally_notice_plugin_slug();
		$one_subscription = Hints::is_plugin_connected_to_one_subscription();
		$is_installed = Hints::is_plugin_installed( $plugin_slug );

		if ( $one_subscription ) {
			return $is_installed
				? [
					'content' => esc_html__( 'Keep your content accessible. Activate Ally, included in ONE, to scan this page.', 'elementor' ),
					'button_text' => esc_html__( 'Activate now', 'elementor' ),
					'button_url' => $this->get_ally_promotion_notice_url(
						Hints::get_plugin_activate_url( $plugin_slug ),
						'acc-scanner-plg-atoms-one-activate',
						'editor-atomic-widget-one-non-activate',
						'editor-one'
					),
				]
				: [
					'content' => esc_html__( 'Want to ensure your content is accessible? Your ONE subscription includes Ally. Install it and scan your page.', 'elementor' ),
					'button_text' => esc_html__( 'Install now', 'elementor' ),
					'button_url' => $this->get_ally_promotion_notice_url(
						Hints::get_plugin_install_url( $plugin_slug ),
						'acc-scanner-plg-atoms-one-install',
						'editor-atomic-widget-one-install',
						'editor-one'
					),
				];
		}

		$content = esc_html__( 'Make sure your content is structured with accessibility in mind. Ally helps detect and fix common issues across your site.', 'elementor' );

		return $is_installed
			? [
				'content' => $content,
				'button_text' => esc_html__( 'Activate now', 'elementor' ),
				'button_url' => $this->get_ally_promotion_notice_url(
					Hints::get_plugin_activate_url( $plugin_slug ),
					'acc-scanner-plg-atoms',
					'editor-atomic-widget',
					'editor'
				),
			]
			: [
				'content' => $content,
				'button_text' => esc_html__( 'Install now', 'elementor' ),
				'button_url' => $this->get_ally_promotion_notice_url(
					Hints::get_plugin_install_url( $plugin_slug ),
					'acc-scanner-plg-atoms',
					'editor-atomic-widget',
					'editor'
				),
			];
	}

	private function get_ally_promotion_notice_url( string $url, string $campaign, string $source, string $medium ): string {
		$url_with_campaign_data = Admin_Notices::add_plg_campaign_data( $url, [
			'name' => self::get_ally_notice_campaign_name(),
			'campaign' => $campaign,
			'source' => $source,
			'medium' => $medium,
		] );

		return Hints::decode_url_for_js( $url_with_campaign_data );
	}
}
