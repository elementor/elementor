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
use Elementor\Modules\Components\PropTypes\Component_Overridable_Prop_Type;
use Elementor\Modules\Components\Transformers\Component_Overridable_Transformer;

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
			'default'        => Experiments_Manager::STATE_INACTIVE,
			'release_status' => Experiments_Manager::RELEASE_STATUS_DEV,
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
		return Component_Overridable_Schema_Extender::make()->get_extended_schema( $schema );
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

	private function register_settings_transformers( Transformers_Registry $transformers ) {
		$transformers->register( Component_Instance_Prop_Type::get_key(), new Component_Instance_Transformer() );
		$transformers->register( Component_Overridable_Prop_Type::get_key(), new Component_Overridable_Transformer() );
	}
}
