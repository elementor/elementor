<?php
namespace Elementor\Modules\CloudLibrary;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Common\Modules\Connect\Module as ConnectModule;
use Elementor\Modules\CloudLibrary\Connect\Cloud_Library;
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
		$this->register_app();
		$this->register_ajax_actions();
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

	private function register_ajax_actions() {
		add_action( 'elementor/ajax/register_actions', function( $ajax ) {
			$handlers = [
				'cloud_library_get_resources' => [ $this, 'ajax_cloud_library_get_resources' ],
			];

			foreach ( $handlers as $tag => $callback ) {
				$ajax->register_ajax_action( $tag, $callback );
			}
		} );
	}

	public function ajax_cloud_library_get_resources( $data ) {
		$app = $this->get_cloud_library_app();

		if ( ! $app->is_connected() ) {
			return [];
		}

		return $app->get_resources();
	}

	private function get_cloud_library_app(): Cloud_Library {
		return Plugin::$instance->common->get_component( 'connect' )->get_app( 'cloud-library' );
	}
}
