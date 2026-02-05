<?php
namespace Elementor\Modules\Components;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers_Registry;
use Elementor\Modules\Components\Styles\Component_Styles;
use Elementor\Modules\Components\Documents\Component as Component_Document;
use Elementor\Modules\Components\Component_Lock_Manager;
use Elementor\Modules\Components\PropTypes\Component_Instance_Prop_Type;
use Elementor\Modules\Components\Transformers\Component_Instance_Transformer;
use Elementor\Modules\Components\PropTypes\Overridable_Prop_Type;
use Elementor\Modules\Components\Transformers\Overridable_Transformer;
use Elementor\Core\Base\Document;
use Elementor\Modules\Components\PropTypes\Override_Prop_Type;
use Elementor\Modules\Components\Transformers\Override_Transformer;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {
	const EXPERIMENT_NAME = 'e_components';
	const PACKAGES        = [ 'editor-components' ];

	public function get_name() {
		return 'components';
	}

	public function __construct() {
		parent::__construct();

		$this->register_component_post_type();

		add_filter( 'elementor/editor/v2/packages', fn ( $packages ) => $this->add_packages( $packages ) );
		add_filter( 'elementor/atomic-widgets/props-schema', fn ( $schema ) => $this->modify_props_schema( $schema ) );
		add_action( 'elementor/documents/register', fn ( $documents_manager ) => $this->register_document_type( $documents_manager ) );
		add_action( 'elementor/document/before_save', fn( Document $document, array $data ) => $this->validate_circular_dependencies( $document, $data ), 10, 2 );
		add_action( 'elementor/document/after_save', fn( Document $document, array $data ) => $this->set_component_overridable_props( $document, $data ), 10, 2 );
		add_filter( 'elementor/global_classes/additional_post_types', fn( $post_types ) => array_merge( $post_types, [ Component_Document::TYPE ] ) );

		add_action( 'elementor/atomic-widgets/settings/transformers/register', fn ( $transformers ) => $this->register_settings_transformers( $transformers ) );

		( Component_Lock_Manager::get_instance()->register_hooks() );
		( new Component_Styles() )->register_hooks();
		( new Components_REST_API() )->register_hooks();
	}

	public static function get_experimental_data() {
		return [
			'name'           => self::EXPERIMENT_NAME,
			'title'          => esc_html__( 'Components', 'elementor' ),
			'description'    => esc_html__( 'Enable components.', 'elementor' ),
			'hidden'         => true,
			'default'        => Experiments_Manager::STATE_ACTIVE,
			'release_status' => Experiments_Manager::RELEASE_STATUS_BETA,
		];
	}

	public function get_widgets() {
		return [
			'Component_Instance',
		];
	}

	private function add_packages( $packages ) {
		return array_merge( $packages, self::PACKAGES );
	}

	private function modify_props_schema( array $schema ) {
		return Overridable_Schema_Extender::make()->get_extended_schema( $schema );
	}

	private function register_component_post_type() {
		register_post_type( Component_Document::TYPE, [
			'label'    => Component_Document::get_title(),
			'labels'   => Component_Document::get_labels(),
			'public'   => false,
			'supports' => Component_Document::get_supported_features(),
		] );
	}

	private function register_document_type( $documents_manager ) {
		$documents_manager->register_document_type(
			Component_Document::TYPE,
			Component_Document::get_class_full_name()
		);
	}

	private function validate_circular_dependencies( Document $document, array $data ) {
		if ( ! $document instanceof Component_Document ) {
			return;
		}

		if ( ! isset( $data['elements'] ) ) {
			return;
		}

		$component_id = $document->get_main_id();
		$elements = $data['elements'];

		$result = Circular_Dependency_Validator::make()->validate( $component_id, $elements );

		if ( ! $result['success'] ) {
			throw new \Exception( esc_html__( "Can't add this component - components that contain each other can't be nested.", 'elementor' ) );
		}
	}

	private function set_component_overridable_props( Document $document, array $data ) {
		if ( ! isset( $data['settings'] ) ) {
			return;
		}
		if ( ( ! $document instanceof Component_Document ) ||
			( ! isset( $data['settings']['overridable_props'] ) )
		) {
			return;
		}

		/* @var Component_Document $document */
		$result = $document->update_overridable_props( $data['settings']['overridable_props'] );

		if ( ! $result->is_valid() ) {
			throw new \Exception( esc_html( 'Settings validation failed for component overridable props: ' . $result->errors()->to_string() ) );
		}
	}

	private function register_settings_transformers( Transformers_Registry $transformers ) {
		$transformers->register( Component_Instance_Prop_Type::get_key(), new Component_Instance_Transformer() );
		$transformers->register( Overridable_Prop_Type::get_key(), new Overridable_Transformer() );
		$transformers->register( Override_Prop_Type::get_key(), new Override_Transformer() );
	}
}
