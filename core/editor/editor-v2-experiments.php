<?php
namespace Elementor\Core\Editor;


use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Editor_V2_Experiments {
	const APP_BAR = 'editor_v2'; // it is `editor_v2` for backward compatibility.
	const ELEMENTS = 'editor_v2_elements';

	public static function all() {
		return [
			static::APP_BAR,
			static::ELEMENTS,
		];
	}

	public static function register() {
		Plugin::$instance->experiments->add_feature( [
			'name' => static::APP_BAR,
			'title' => esc_html__( 'Editor Top Bar', 'elementor' ),
			'description' => sprintf(
				'%1$s <a href="https://go.elementor.com/wp-dash-elementor-top-bar/" target="_blank">%2$s</a>',
				esc_html__( 'Get a sneak peek of the new Editor powered by React. The beautiful design and experimental layout of the Top bar are just some of the exciting tools on their way.', 'elementor' ),
				esc_html__( 'Learn more', 'elementor' )
			),
			'default' => Experiments_Manager::STATE_INACTIVE,
			'release_status' => Experiments_Manager::RELEASE_STATUS_BETA,
			'new_site' => [
				'default_active' => true,
				'minimum_installation_version' => '3.23.0',
			],
		] );

		Plugin::$instance->experiments->add_feature( [
			'name' => static::ELEMENTS,
			'title' => esc_html__( 'Elements', 'elementor' ),
			'description' => esc_html__( 'Enable the new elements.', 'elementor' ),
			'hidden' => true,
			'default' => Experiments_Manager::STATE_INACTIVE,
			'release_status' => Experiments_Manager::RELEASE_STATUS_ALPHA,
		] );
	}
}
