<?php
namespace Elementor\Modules\CloudLibrary;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Common\Modules\Connect\Module as ConnectModule;
use Elementor\Modules\CloudLibrary\Connect\Cloud_Library;
use Elementor\Core\Common\Modules\Connect\Apps\Library;
use Elementor\Core\Experiments\Manager as ExperimentsManager;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {

	public function get_name(): string {
		return 'cloud-library';
	}

	public function __construct() {
		parent::__construct();

		$this->register_experiment();

		if ( Plugin::$instance->experiments->is_feature_active( $this->get_name() ) ) {
			$this->register_app();

			add_action( 'elementor/init', function () {
				$this->set_cloud_library_settings();
			}, 12 /** After the initiation of the connect cloud library */ );
		}
	}

	private function register_experiment() {
		Plugin::$instance->experiments->add_feature( [
			'name' => $this->get_name(),
			'title' => esc_html__( 'Cloud Library', 'elementor' ),
			'description' => esc_html__( 'Enable Cloud Library.', 'elementor' ),
			'release_status' => ExperimentsManager::RELEASE_STATUS_DEV,
			'default' => ExperimentsManager::STATE_INACTIVE,
			'hidden' => true,
		] );
	}

	private function register_app() {
		add_action( 'elementor/connect/apps/register', function ( ConnectModule $connect_module ) {
			$connect_module->register_app( 'cloud-library', Cloud_Library::get_class_name() );
		} );
	}

	private function set_cloud_library_settings() {
		if ( ! Plugin::$instance->common ) {
			return;
		}

		/** @var ConnectModule $connect */
		$connect = Plugin::$instance->common->get_component( 'connect' );

		/** @var Library $library */
		$library = $connect->get_app( 'library' );

		if ( ! $library ) {
			return;
		}

		Plugin::$instance->app->set_settings( 'cloud-library', [
			'library_connect_url'  => esc_url( $library->get_admin_url( 'authorize', [
				'utm_source' => 'template-library',
				'utm_medium' => 'wp-dash',
				'utm_campaign' => 'library-connect',
				'utm_content' => 'cloud-library',
			] ) ),
			'library_connect_title' => esc_html__( 'Connect', 'elementor' ),
			'library_connect_sub_title' => esc_html__( 'Sub Title', 'elementor' ),
			'library_connect_button_text' => esc_html__( 'Connect', 'elementor' ),
		] );
	}
}
