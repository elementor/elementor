<?php
namespace Elementor\Modules\Components;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers_Registry;
use Elementor\Modules\Components\Styles\Component_Styles;
use Elementor\Modules\Components\Documents\Component as Component_Document;
use Elementor\Modules\Components\Document_Lock_Manager;
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

const ONE_HOUR = 60 * 60;

class Module extends BaseModule {
	private $lock_manager;
	const EXPERIMENT_NAME = 'e_components';
	const PACKAGES        = [ 'editor-components' ];

	public function get_name() {
		return 'components';
	}

	public function __construct() {
		parent::__construct();
		add_filter( 'elementor/editor/v2/packages', fn ( $packages ) => $this->add_packages( $packages ) );
		add_action( 'elementor/documents/register', fn ( $documents_manager ) => $this->register_document_type( $documents_manager ) );
		add_action( 'elementor/atomic-widgets/settings/transformers/register', fn ( $transformers ) => $this->register_settings_transformers( $transformers ) );

		( new Component_Styles() )->register_hooks();
		( new Components_REST_API() )->register_hooks();
		$this->register_lock_hooks();
	}

	public static function get_experimental_data() {
		return [
			'name'           => self::EXPERIMENT_NAME,
			'title'          => esc_html__( 'Components', 'elementor' ),
			'description'    => esc_html__( 'Enable components.', 'elementor' ),
			'hidden'         => true,
			'default'        => Experiments_Manager::STATE_INACTIVE,
			'release_status' => Experiments_Manager::RELEASE_STATUS_DEV,
		];
	}

	public function get_widgets() {
		return [
			'Component',
		];
	}

	private function get_lock_manager() {
		return self::get_lock_manager_instance();
	}

	public static function get_lock_manager_instance() {
		static $instance = null;

		if ( null === $instance ) {
			$instance = new Document_Lock_Manager(ONE_HOUR);
		}

		return $instance;
	}

	private function add_packages( $packages ) {
		return array_merge( $packages, self::PACKAGES );
	}

	private function register_document_type( $documents_manager ) {
		$documents_manager->register_document_type(
			Component_Document::TYPE,
			Component_Document::get_class_full_name()
		);

		register_post_type( Component_Document::TYPE, [
			'label'    => Component_Document::get_title(),
			'labels'   => Component_Document::get_labels(),
			'public'   => false,
			'supports' => Component_Document::get_supported_features(),
		] );
	}

	private function register_settings_transformers( Transformers_Registry $transformers ) {
		$transformers->register( Component_Id_Prop_Type::get_key(), new Component_Id_Transformer() );
	}


	private function register_lock_hooks() {
		add_filter( 'heartbeat_received', [ $this, 'heartbeat_received' ], 10, 2 );
		add_filter( 'heartbeat_send', [ $this, 'heartbeat_send' ], 10, 2 );
	}

	public function lock_component_on_edit( $post_id = null ) {
		if ( ! $post_id ) {
			$post_id = get_the_ID();
		}

		if ( ! $this->is_component_post( $post_id ) ) {
			return;
		}


		$this->lock_component( $post_id );
	}

	public function unlock_component_after_save( $post_id ) {
		if ( ! $this->is_component_post( $post_id ) ) {
			return;
		}

		$this->unlock_component( $post_id );
	}

	public function check_component_lock( $post_id ) {
		if ( ! $this->is_component_post( $post_id ) ) {
			return;
		}

		$locked_user = $this->get_locked_user( $post_id );
		if ( $locked_user && get_current_user_id() !== $locked_user->ID ) {
			/* translators: %s: User display name */
			return new \WP_Error( 'component_locked', sprintf( __( 'This component is currently being edited by %s. Please try again later.', 'elementor' ), $locked_user->display_name ) );
		}
		return true;
	}

	public function lock_component( $post_id ) {
		$lock_manager = $this->get_lock_manager();
		return $lock_manager->lock_document( $post_id );
	}

	public function unlock_component( $post_id ) {
		$lock_manager = $this->get_lock_manager();
			return $lock_manager->unlock_document( $post_id );
	}

	public function get_locked_user( $post_id ) {
		$lock_manager = $this->get_lock_manager();
		return $lock_manager->get_locked_user( $post_id );
	}

	private function is_component_post( $post_id ) {
		return get_post_type( $post_id ) === Component_Document::TYPE;
	}

	public function heartbeat_received( $response, $data ) {
		// Handle Elementor post lock for components
		if ( isset( $data['elementor_post_lock']['post_ID'] ) ) {
			$post_id = $data['elementor_post_lock']['post_ID'];

			if ( $this->is_component_post( $post_id ) ) {
				$locked_user = $this->get_locked_user( $post_id );

				// Prevent force lock for components
				if ( ! empty( $data['elementor_force_post_lock'] ) ) {
					// Don't allow force lock for components
					$response['component_locked'] = $locked_user ? $locked_user->display_name : false;
					return $response;
				}

				if ( ! $locked_user ) {
					$this->lock_component( $post_id );
				} else {
					// For components, don't send locked_user - send component_locked instead
					$response['component_locked'] = $locked_user->display_name;
				}
			}
		}

		// Handle component-specific lock
		if ( isset( $data['elementor_component_lock']['component_id'] ) ) {
			$component_id = $data['elementor_component_lock']['component_id'];
			$lock_manager = $this->get_lock_manager();

			// Extend lock if user owns it
			$locked_user = $lock_manager->get_locked_user( $component_id );
			if ( $locked_user && get_current_user_id() === $locked_user->ID ) {
				$lock_manager->extend_lock( $component_id );
			} else {
				$response['component_locked'] = $locked_user ? $locked_user->display_name : false;
			}
		}

		return $response;
	}

	public function heartbeat_send( $data, $screen_id ) {
		if ( 'elementor' === $screen_id && isset( $_GET['post'] ) ) {
			$post_id = sanitize_text_field( wp_unslash( $_GET['post'] ) );
			$data['elementor_component_lock'] = [
				'component_id' => $post_id,
			];
		}
		return $data;
	}
}
