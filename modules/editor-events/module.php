<?php

namespace Elementor\Modules\EditorEvents;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Common\Modules\Connect\Apps\Base_App;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Utils;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {

	const ELEMENTOR_EDITOR_EVENTS_DATA_SYSTEM_URL = 'https://my.elementor.com/api/v1/editor-events';

	const EXPERIMENT_NAME = 'editor_events';

	public function __construct() {
		parent::__construct();

		$this->register_experiment();
	}

	public function get_name() {
		return 'editor-events';
	}

	public static function get_editor_events_config() {
		$can_send_events = false;

		$settings = [
			'can_send_events' => $can_send_events,
			'elementor_version' => ELEMENTOR_VERSION,
			'site_url' => hash( 'sha256', get_site_url() ),
			'wp_version' => get_bloginfo( 'version' ),
			'user_agent' => esc_html( Utils::get_super_global_value( $_SERVER, 'HTTP_USER_AGENT' ) ),
			'site_language' => get_locale(),
			'site_key' => get_option( Base_App::OPTION_CONNECT_SITE_KEY ),
			'subscription_id' => null,
		];

		if ( $can_send_events ) {
			$settings['data_system_url'] = self::ELEMENTOR_EDITOR_EVENTS_DATA_SYSTEM_URL;
		}

		return $settings;
	}

	private function register_experiment() {
		Plugin::$instance->experiments->add_feature( [
			'name' => static::EXPERIMENT_NAME,
			'title' => esc_html__( 'Elementor Editor Events', 'elementor' ),
			'description' => esc_html__( 'Editor events processing', 'elementor' ),
			'hidden' => true,
			'default' => Experiments_Manager::STATE_INACTIVE,
		] );
	}
}
