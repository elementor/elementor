<?php
namespace Elementor\TemplateLibrary;

use Elementor\App\App;
use Elementor\Plugin;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Promotion {
	public function get_promotion_details( $type = null ) {
		$license_valid = App::$instance->services->get_service( 'license' )->is_valid();
		$has_pro = Utils::has_pro();

		$library = Plugin::$instance->common->get_component( 'connect' )->get_app( 'library' );
		$is_connected = $library && $library->is_connected();

		if ( ! $license_valid ) {
			$promotion = [
				'action_button' => [
					'text' => esc_html__( 'Upgrade', 'elementor' ),
					'url' => 'https://go.elementor.com/go-pro-templates',
				],
			];
		} elseif ( $license_valid ) {
			$promotion = [
				'title' => esc_html__( 'Connect & Activate', 'elementor' ),
				'content' => esc_html__( 'Connect your Elementor account to activate Elementor Pro and unlock all the features.', 'elementor' ),
				'action_button' => [
					'text' => esc_html__( 'Connect & Activate', 'elementor' ),
					'url' => admin_url( 'admin.php?page=elementor-license' ),
				],
			];
		} else {
			$promotion = [
				'title' => esc_html__( 'Go Pro', 'elementor' ),
				'content' => esc_html__( 'Unlock all the features of Elementor Pro and build sites faster and better.', 'elementor' ),
				'action_button' => [
					'text' => esc_html__( 'Upgrade', 'elementor' ),
					'url' => 'https://go.elementor.com/go-pro-templates',
				],
			];
		}
		$details = [
			'url' => 'https://go.elementor.com/renew-template-library/',
			'text' => esc_html__( 'Renew now', 'elementor' ),
		];

		if ( ! empty( $type ) && ! empty( $details[ $type ] ) ) {
			return $details[ $type ];
		}

		return $details;
	}
}
