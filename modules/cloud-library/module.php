<?php
namespace Elementor\Modules\CloudLibrary;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Common\Modules\Connect\Module as ConnectModule;
use Elementor\Core\Documents_Manager;
use Elementor\Core\Frontend\Render_Mode_Manager;
use Elementor\Core\Utils\Exceptions;
use Elementor\Modules\CloudLibrary\Connect\Cloud_Library;
use Elementor\Core\Common\Modules\Connect\Apps\Library;
use Elementor\Core\Experiments\Manager as ExperimentsManager;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {

	/**
	 * @var callable
	 */
	protected $print_preview_callback;

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

			add_filter( 'elementor/editor/localize_settings', function ( $settings ) {
				return $this->localize_settings( $settings );
			}, 11 /** After Elementor Core */ );
		}
	}

	public function localize_settings( $settings ) {
		if ( ! isset( $settings['i18n'] ) ) {
			return $settings;
		}

		$settings['i18n']['folder'] = 'Folder';

		return $settings;
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

		add_action( 'elementor/ajax/register_actions', [ $this, 'register_ajax_actions' ] );
		add_action( 'elementor/frontend/render_mode/register', [ $this, 'register_render_mode' ] );

		add_action( 'elementor/documents/register', function ( Documents_Manager $documents_manager ) {
			$documents_manager->register_document_type(
		Documents\Cloud_Template_Preview::TYPE,
			Documents\Cloud_Template_Preview::get_class_full_name()
		);
} );
	}

	/**
	 * @param \Elementor\Core\Common\Modules\Ajax\Module $ajax_manager
	 */
	public function register_ajax_actions( $ajax_manager ) {
		$ajax_manager->register_ajax_action( 'screenshot_cloud_save', [ $this, 'ajax_save' ] );
	}

	public function ajax_save( $data ) {
		if ( empty( $data['screenshot'] ) || empty( $data['template_id'] ) ) {
			return false;
		}

		/**
		 * @var Cloud_Library $cloud_library_app
		 */
		$cloud_library_app = Plugin::$instance->common->get_component( 'connect' )->get_app( 'cloud-library' );

		if ( ! $cloud_library_app ) {
			$error_message = esc_html__( 'Cloud-Library is not instantiated.', 'elementor' );

			throw new \Exception( $error_message, Exceptions::FORBIDDEN ); // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
		}

		$raw_binary = base64_decode( substr( $data['screenshot'], strlen( 'data:image/png;base64,' ) ) );

		return $cloud_library_app->update_resource_preview( $data['template_id'], $raw_binary );
	}

	/**
	 * @param Render_Mode_Manager $manager
	 *
	 * @throws \Exception
	 */
	public function register_render_mode( Render_Mode_Manager $manager ) {
		$manager->register_render_mode( Render_Mode_Preview::class );
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
				'source' => 'cloud-library',
			] ) ),
			'library_connect_title' => esc_html__( 'Connect', 'elementor' ),
			'library_connect_sub_title' => esc_html__( 'Sub Title', 'elementor' ),
			'library_connect_button_text' => esc_html__( 'Connect', 'elementor' ),
		] );
	}

	public function print_content() {
		if ( ! $this->print_preview_callback ) {
			$this->print_preview_callback = [ $this, 'print_thumbnail_preview_callback' ];
		}

		call_user_func( $this->print_preview_callback );
	}

	private function print_thumbnail_preview_callback() {
		$doc = Plugin::$instance->documents->get_current();

		echo Plugin::$instance->frontend->get_builder_content_for_display( $doc->get_main_id(), true );

		wp_delete_post( $doc->get_main_id(), true );
	}
}
