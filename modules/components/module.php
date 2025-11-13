<?php
namespace Elementor\Modules\Components;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers_Registry;
use Elementor\Modules\Components\Styles\Component_Styles;
use Elementor\Modules\Components\Documents\Component as Component_Document;
use Elementor\Modules\Components\Component_Lock_Manager;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Array_Prop_Type;
use Elementor\Modules\Components\PropTypes\Component_Overridable_Prop_Type;

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
			'Component',
		];
	}

	private function add_packages( $packages ) {
		return array_merge( $packages, self::PACKAGES );
	}

	private function modify_props_schema( array $schema ) {
		$result = [];

		foreach ( $schema as $key => $prop_type ) {
			if ( ! ( $prop_type instanceof Prop_Type ) ) {
				$result[ $key ] = $prop_type;

				continue;
			}

			$result[ $key ] = $this->get_modified_prop_type( $prop_type );
		}

		return $result;
	}
	
	private function get_modified_prop_type( Prop_Type $prop_type ) {
		$transformable_prop_types = $prop_type instanceof Union_Prop_Type ?
			$prop_type->get_prop_types() :
			[ $prop_type ];

		foreach ( $transformable_prop_types as $transformable_prop_type ) {
			if ( $transformable_prop_type instanceof Object_Prop_Type ) {
				$transformable_prop_type->set_shape(
					$this->get_modified_prop_types( $transformable_prop_type->get_shape() )
				);
			}

			if ( $transformable_prop_type instanceof Array_Prop_Type ) {
				$transformable_prop_type->set_item_type(
					$this->get_modified_prop_type( $transformable_prop_type->get_item_type() )
				);
			}
		}


		$overridable_prop_type = Component_Overridable_Prop_Type::make();
		$union_prop_type = $prop_type;

		if ( $prop_type instanceof Transformable_Prop_Type ) {
			$union_prop_type = Union_Prop_Type::create_from( $prop_type );
		}

		$union_prop_type->add_prop_type( $overridable_prop_type );

		return $union_prop_type;
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
		$transformers->register( Component_Id_Prop_Type::get_key(), new Component_Id_Transformer() );
	}
}
