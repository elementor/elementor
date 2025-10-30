<?php
namespace Elementor\Modules\Components;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers_Registry;
use Elementor\Modules\Components\Styles\Component_Styles;
use Elementor\Modules\Components\Documents\Component as Component_Document;
use Elementor\Modules\Components\Lock_Component_Manager;
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {
	private static $lock_component_manager_instance = null;
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

		( Lock_Component_Manager::get_instance()->register_hooks() );
		( new Component_Styles() )->register_hooks();
		( new Components_REST_API() )->register_hooks();
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
}
