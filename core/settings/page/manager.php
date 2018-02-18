<?php
namespace Elementor\Core\Settings\Page;

use Elementor\Core\Utils\Exceptions;
use Elementor\CSS_File;
use Elementor\Core\Settings\Base\Manager as BaseManager;
use Elementor\Core\Settings\Manager as SettingsManager;
use Elementor\Core\Settings\Base\Model as BaseModel;
use Elementor\DB;
use Elementor\Plugin;
use Elementor\Post_CSS_File;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor page settings manager class.
 *
 * Elementor page settings manager handler class is responsible for registering
 * and managing Elementor page settings managers.
 *
 * @since 1.6.0
 */
class Manager extends BaseManager {

	/**
	 * Elementor Canvas template name.
	 */
	const TEMPLATE_CANVAS = 'elementor_canvas';

	/**
	 * Meta key for the page settings.
	 */
	const META_KEY = '_elementor_page_settings';

	/**
	 * Page settings manager constructor.
	 *
	 * Initializing Elementor page settings manager.
	 *
	 * @since 1.6.0
	 * @access public
	 */
	public function __construct() {
		parent::__construct();

		add_action( 'init', [ $this, 'init' ] );

		add_filter( 'template_include', [ $this, 'template_include' ] );
	}

	/**
	 * Get page data.
	 *
	 * Retrieves page data for any given a page ID.
	 *
	 * @since 1.6.0
	 * @deprecated 1.6.0
	 * @access public
	 * @static
	 *
	 * @param int $id Page ID.
	 *
	 * @return BaseModel
	 */
	public static function get_page( $id ) {
		return SettingsManager::get_settings_managers( 'page' )->get_model( $id );
	}

	/**
	 * Add page templates.
	 *
	 * Add the Elementor Canvas page templates to the theme templates.
	 *
	 * Fired by `theme_{$post_type}_templates` filter.
	 *
	 * @since 1.6.0
	 * @access public
	 * @static
	 *
	 * @param array $post_templates Array of page templates. Keys are filenames,
	 *                              values are translated names.
	 *
	 * @return array Page templates.
	 */
	public static function add_page_templates( $post_templates ) {
		$post_templates = [
			self::TEMPLATE_CANVAS => __( 'Elementor', 'elementor' ) . ' ' . __( 'Canvas', 'elementor' ),
		] + $post_templates;

		return $post_templates;
	}

	/**
	 * Is CPT supports custom templates.
	 *
	 * Whether the Custom Post Type supports templates.
	 *
	 * @since 1.6.0
	 * @deprecated 2.0.0
	 * @access public
	 * @static
	 *
	 * @return bool True is templates are supported, False otherwise.
	 */
	public static function is_cpt_custom_templates_supported() {
		// Todo: _deprecated_function( __METHOD__, '2.0.0', 'Utils::is_cpt_custom_templates_supported' );

		return Utils::is_cpt_custom_templates_supported();
	}

	/**
	 * Template include.
	 *
	 * Update the path for the Elementor Canvas template.
	 *
	 * Fired by `template_include` filter.
	 *
	 * @since 1.6.0
	 * @access public
	 *
	 * @param string $template The path of the template to include.
	 *
	 * @return string The path of the template to include.
	 */
	public function template_include( $template ) {
		if ( is_singular() ) {
			$document = Plugin::$instance->documents->get_doc_for_frontend( get_the_ID() );

			if ( self::TEMPLATE_CANVAS === $document->get_meta( '_wp_page_template' ) ) {
				$template = ELEMENTOR_PATH . '/includes/page-templates/canvas.php';
			}
		}

		return $template;
	}

	/**
	 * Init.
	 *
	 * Initialize Elementor page settings manager.
	 *
	 * @since 1.6.0
	 * @access public
	 */
	public function init() {
		$post_types = get_post_types_by_support( 'elementor' );

		foreach ( $post_types as $post_type ) {
			add_filter( "theme_{$post_type}_templates", [ __CLASS__, 'add_page_templates' ], 10, 4 );
		}
	}

	/**
	 * Get manager name.
	 *
	 * Retrieve page settings manager name.
	 *
	 * @since 1.6.0
	 * @access public
	 *
	 * @return string Manager name.
	 */
	public function get_name() {
		return 'page';
	}

	/**
	 * Get model for config.
	 *
	 * Retrieve the model for settings configuration.
	 *
	 * @since 1.6.0
	 * @access public
	 *
	 * @return BaseModel The model object.
	 */
	public function get_model_for_config() {
		if ( Plugin::$instance->editor->is_edit_mode() ) {
			$document = Plugin::$instance->documents->get_doc_or_auto_save( get_the_ID() );
		} else {
			$document = Plugin::$instance->documents->get_doc_for_frontend( get_the_ID() );
		}

		$model = $this->get_model( $document->get_post()->ID );

		if ( $document->is_autosave() ) {
			$model->set_settings( 'post_status', $document->get_main_post()->post_status );
		}

		return $model;
	}

	/**
	 * Ajax before saving settings.
	 *
	 * Validate the data before saving it and updating the data in the database.
	 *
	 * @since 1.6.0
	 * @access public
	 *
	 * @param array $data Post data.
	 * @param int   $id   Post ID.
	 *
	 * @throws \Exception If invalid post returned using the `$id`.
	 * @throws \Exception If current user don't have permissions to edit the post.
	 */
	public function ajax_before_save_settings( array $data, $id ) {
		$post = get_post( $id );

		if ( empty( $post ) ) {
			throw new \Exception( 'Invalid post.', Exceptions::NOT_FOUND );
		}

		if ( ! current_user_can( 'edit_post', $id ) ) {
			throw new \Exception( 'Access denied.', Exceptions::FORBIDDEN );
		}

		// Avoid save empty post title.
		if ( ! empty( $data['post_title'] ) ) {
			$post->post_title = $data['post_title'];
		}

		if ( isset( $data['post_excerpt'] ) && post_type_supports( $post->post_type, 'excerpt' ) ) {
			$post->post_excerpt = $data['post_excerpt'];
		}

		if ( isset( $data['post_status'] ) ) {
			$this->save_post_status( $id, $data['post_status'] );
			unset( $post->post_status );
		}

		wp_update_post( $post );

		if ( empty( $data['post_featured_image']['id'] ) ) {
			delete_post_thumbnail( $post->ID );
		} else {
			set_post_thumbnail( $post->ID, $data['post_featured_image']['id'] );
		}

		if ( DB::STATUS_PUBLISH === $post->post_status ) {
			$autosave = Utils::get_post_autosave( $post->ID );
			if ( $autosave ) {
				wp_delete_post_revision( $autosave->ID );
			}
		}

		if ( empty( $data['post_featured_image']['id'] ) ) {
			delete_post_thumbnail( $post->ID );
		} else {
			set_post_thumbnail( $post->ID, $data['post_featured_image']['id'] );
		}

		if ( Utils::is_cpt_custom_templates_supported() ) {
			$template = 'default';

			if ( isset( $data['template'] ) ) {
				$template = $data['template'];
			}

			// Use `update_metadata` in order to save also for revisions.
			update_metadata( 'post', $post->ID, '_wp_page_template', $template );
		}
	}

	/**
	 * Save settings to DB.
	 *
	 * Save page settings to the database, as post meta data.
	 *
	 * @since 1.6.0
	 * @access protected
	 *
	 * @param array $settings Settings.
	 * @param int   $id       Post ID.
	 */
	protected function save_settings_to_db( array $settings, $id ) {
		// Use update/delete_metadata in order to handle also revisions.
		if ( ! empty( $settings ) ) {
			update_metadata( 'post', $id, self::META_KEY, $settings );
		} else {
			delete_metadata( 'post', $id, self::META_KEY );
		}
	}

	/**
	 * Get CSS file for update.
	 *
	 * Retrieve the CSS file before updating the it.
	 *
	 * @since 1.6.0
	 * @access protected
	 *
	 * @param int $id Post ID.
	 *
	 * @return Post_CSS_File The post CSS file object.
	 */
	protected function get_css_file_for_update( $id ) {
		return false;
	}

	/**
	 * Get saved settings.
	 *
	 * Retrieve the saved settings from the post meta.
	 *
	 * @since 1.6.0
	 * @access protected
	 *
	 * @param int $id Post ID.
	 *
	 * @return array Saved settings.
	 */
	protected function get_saved_settings( $id ) {
		$settings = get_post_meta( $id, self::META_KEY, true );

		if ( ! $settings ) {
			$settings = [];
		}

		if ( self::is_cpt_custom_templates_supported() ) {
			$saved_template = get_post_meta( $id, '_wp_page_template', true );

			if ( $saved_template ) {
				$settings['template'] = $saved_template;
			}
		}

		return $settings;
	}

	/**
	 * Get CSS file name.
	 *
	 * Retrieve CSS file name for the page settings manager.
	 *
	 * @since 1.6.0
	 * @access protected
	 *
	 * @return string CSS file name.
	 */
	protected function get_css_file_name() {
		return 'post';
	}

	/**
	 * Get model for CSS file.
	 *
	 * Retrieve the model for the CSS file.
	 *
	 * @since 1.6.0
	 * @access protected
	 *
	 * @param CSS_File $css_file The requested CSS file.
	 *
	 * @return BaseModel The model object.
	 */
	protected function get_model_for_css_file( CSS_File $css_file ) {
		if ( ! $css_file instanceof Post_CSS_File ) {
			return null;
		}

		return $this->get_model( $css_file->get_post_id() );
	}

	/**
	 * Get special settings names.
	 *
	 * Retrieve the names of the special settings that are not saved as regular
	 * settings. Those settings have a separate saving process.
	 *
	 * @since 1.6.0
	 * @access protected
	 *
	 * @return array Special settings names.
	 */
	protected function get_special_settings_names() {
		return [
			'id',
			'post_title',
			'post_status',
			'template',
			'post_featured_image',
		];
	}

	public function save_post_status( $post_id, $status ) {
		$parent_id = wp_is_post_revision( $post_id );

		if ( ! $parent_id ) {
			$parent_id = $post_id;
		}

		$post = get_post( $parent_id );

		$allowed_post_statuses = get_post_statuses();

		if ( isset( $allowed_post_statuses[ $status ] ) ) {
			$post_type_object = get_post_type_object( $post->post_type );
			if ( 'publish' !== $status || current_user_can( $post_type_object->cap->publish_posts ) ) {
				$post->post_status = $status;
			}
		}

		wp_update_post( $post );
	}
}
