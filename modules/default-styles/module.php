<?php

namespace Elementor\Modules\DefaultStyles;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;
use Elementor\Modules\DefaultStyles\ImportExportCustomization\Import_Export_Customization;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Module extends BaseModule {
	const EXPERIMENT_NAME = 'e_default_styles';

	public function get_name() {
		return 'default-styles';
	}

	public static function get_experimental_data() {
		return [
			'name' => self::EXPERIMENT_NAME,
			'title' => esc_html__( 'HTML Tag Default Styles', 'elementor' ),
			'description' => esc_html__( 'Enable site-wide default styles for HTML tags.', 'elementor' ),
			'hidden' => true,
			'default' => Experiments_Manager::STATE_INACTIVE,
			'release_status' => Experiments_Manager::RELEASE_STATUS_DEV,
		];
	}

	public function __construct() {
		parent::__construct();

		if ( ! Plugin::$instance->experiments->is_feature_active( self::EXPERIMENT_NAME ) ) {
			return;
		}

		if ( ! Plugin::$instance->experiments->is_feature_active( Atomic_Widgets_Module::EXPERIMENT_NAME ) ) {
			return;
		}

		( new Default_Style_Post_Type() )->register();
		( new Default_Styles_Tag_Post_IDs() )->register_hooks();

		( new Default_Styles_REST_API() )->register_hooks();
		( new Atomic_Default_Styles() )->register_hooks();
		( new Import_Export_Customization() )->register_hooks();

		add_filter(
			'elementor/kit/meta_to_preserve_on_kit_import',
			[ $this, 'add_meta_to_preserve_on_kit_import' ]
		);

		add_action( 'elementor/kit/after_new_kit_created', [ $this, 'clone_default_styles_for_new_kit' ], 10, 1 );
	}

	public function add_meta_to_preserve_on_kit_import( array $meta_keys ): array {
		return array_merge( $meta_keys, [
			Default_Styles_Tag_Post_IDs::META_KEY,
		] );
	}

	public function clone_default_styles_for_new_kit( array $params ): void {
		[ 'new_kit_id' => $new_kit_id, 'previous_kit_id' => $previous_kit_id ] = $params;

		$previous_kit = Plugin::$instance->kits_manager->get_kit( $previous_kit_id );
		$new_kit = Plugin::$instance->kits_manager->get_kit( $new_kit_id );

		if ( ! $previous_kit || ! $new_kit ) {
			return;
		}

		$tags = Default_Styles_Tag_Post_IDs::make( $previous_kit )->get_all();

		foreach ( array_keys( $tags ) as $tag ) {
			Default_Style_Post::clone_to_other_kit( $tag, $previous_kit, $new_kit );
		}
	}
}
