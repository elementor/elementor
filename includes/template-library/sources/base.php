<?php
namespace Elementor\TemplateLibrary;

use Elementor\Controls_Stack;
use Elementor\Plugin;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor template library source base.
 *
 * Elementor template library source base handler class is responsible for
 * initializing all the methods controlling the source of Elementor templates.
 *
 * @since 1.0.0
 * @abstract
 */
abstract class Source_Base {

	/**
	 * User meta.
	 *
	 * Holds the current user meta data.
	 *
	 * @access private
	 *
	 * @var array
	 */
	private $user_meta;

	/**
	 * Get template ID.
	 *
	 * Retrieve the template ID.
	 *
	 * @since 1.0.0
	 * @access public
	 * @abstract
	 */
	abstract public function get_id();

	/**
	 * Get template title.
	 *
	 * Retrieve the template title.
	 *
	 * @since 1.0.0
	 * @access public
	 * @abstract
	 */
	abstract public function get_title();

	/**
	 * Register template data.
	 *
	 * Used to register custom template data like a post type, a taxonomy or any
	 * other data.
	 *
	 * @since 1.0.0
	 * @access public
	 * @abstract
	 */
	abstract public function register_data();

	/**
	 * Get templates.
	 *
	 * Retrieve templates from the template library.
	 *
	 * @since 1.0.0
	 * @access public
	 * @abstract
	 *
	 * @param array $args Optional. Filter templates list based on a set of
	 *                    arguments. Default is an empty array.
	 */
	abstract public function get_items( $args = [] );

	/**
	 * Get template.
	 *
	 * Retrieve a single template from the template library.
	 *
	 * @since 1.0.0
	 * @access public
	 * @abstract
	 *
	 * @param int $template_id The template ID.
	 */
	abstract public function get_item( $template_id );

	/**
	 * Get template data.
	 *
	 * Retrieve a single template data from the template library.
	 *
	 * @since 1.5.0
	 * @access public
	 * @abstract
	 *
	 * @param array $args Custom template arguments.
	 */
	abstract public function get_data( array $args );

	/**
	 * Delete template.
	 *
	 * Delete template from the database.
	 *
	 * @since 1.0.0
	 * @access public
	 * @abstract
	 *
	 * @param int $template_id The template ID.
	 */
	abstract public function delete_template( $template_id );

	/**
	 * Save template.
	 *
	 * Save new or update existing template on the database.
	 *
	 * @since 1.0.0
	 * @access public
	 * @abstract
	 *
	 * @param array $template_data The template data.
	 */
	abstract public function save_item( $template_data );

	/**
	 * Update template.
	 *
	 * Update template on the database.
	 *
	 * @since 1.0.0
	 * @access public
	 * @abstract
	 *
	 * @param array $new_data New template data.
	 */
	abstract public function update_item( $new_data );

	/**
	 * Export template.
	 *
	 * Export template to a file.
	 *
	 * @since 1.0.0
	 * @access public
	 * @abstract
	 *
	 * @param int $template_id The template ID.
	 */
	abstract public function export_template( $template_id );

	/**
	 * Template library source base constructor.
	 *
	 * Initializing the template library source base by registering custom
	 * template data.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function __construct() {
		$this->register_data();
	}

	/**
	 * Mark template as favorite.
	 *
	 * Update user meta containing his favorite templates. For a given template
	 * ID, add the template to the favorite templates or remove it from the
	 * favorites, based on the `favorite` parameter.
	 *
	 * @since 1.9.0
	 * @access public
	 *
	 * @param int  $template_id The template ID.
	 * @param bool $favorite    Optional. Whether the template is marked as
	 *                          favorite, or not. Default is true.
	 *
	 * @return int|bool User meta ID if the key didn't exist, true on successful
	 *                  update, false on failure.
	 */
	public function mark_as_favorite( $template_id, $favorite = true ) {
		$favorites_templates = $this->get_user_meta( 'favorites' );

		if ( ! $favorites_templates ) {
			$favorites_templates = [];
		}

		if ( $favorite ) {
			$favorites_templates[ $template_id ] = $favorite;
		} elseif ( isset( $favorites_templates[ $template_id ] ) ) {
			unset( $favorites_templates[ $template_id ] );
		}

		return $this->update_user_meta( 'favorites', $favorites_templates );
	}

	/**
	 * Get current user meta.
	 *
	 * Retrieve Elementor meta data for the current user.
	 *
	 * @since 1.9.0
	 * @access public
	 *
	 * @param string $item Optional. User meta key. Default is null.
	 *
	 * @return null|array An array of user meta data, or null otherwise.
	 */
	public function get_user_meta( $item = null ) {
		if ( null === $this->user_meta ) {
			$this->user_meta = get_user_meta( get_current_user_id(), $this->get_user_meta_prefix(), true );
		}

		if ( ! $this->user_meta ) {
			$this->user_meta = [];
		}

		if ( $item ) {
			if ( isset( $this->user_meta[ $item ] ) ) {
				return $this->user_meta[ $item ];
			}

			return null;
		}

		return $this->user_meta;
	}

	/**
	 * Update current user meta.
	 *
	 * Update user meta data based on meta key an value.
	 *
	 * @since 1.9.0
	 * @access public
	 *
	 * @param string $key   Optional. User meta key.
	 * @param mixed  $value Optional. User meta value.
	 *
	 * @return int|bool User meta ID if the key didn't exist, true on successful
	 *                  update, false on failure.
	 */
	public function update_user_meta( $key, $value ) {
		$meta = $this->get_user_meta();

		$meta[ $key ] = $value;

		$this->user_meta = $meta;

		return update_user_meta( get_current_user_id(), $this->get_user_meta_prefix(), $meta );
	}

	/**
	 * Replace elements IDs.
	 *
	 * For any given Elementor content/data, replace the IDs with new randomly
	 * generated IDs.
	 *
	 * @since 1.0.0
	 * @access protected
	 *
	 * @param array $content Any type of Elementor data.
	 *
	 * @return mixed Iterated data.
	 */
	protected function replace_elements_ids( $content ) {
		return Plugin::$instance->db->iterate_data( $content, function( $element ) {
			$element['id'] = Utils::generate_random_string();

			return $element;
		} );
	}

	/**
	 * Get Elementor library user meta prefix.
	 *
	 * Retrieve user meta prefix used to save Elementor data.
	 *
	 * @since 1.9.0
	 * @access protected
	 *
	 * @return string User meta prefix.
	 */
	protected function get_user_meta_prefix() {
		return 'elementor_library_' . $this->get_id();
	}

	/**
	 * Process content for export/import.
	 *
	 * Process the content and all the inner elements, and prepare all the
	 * elements data for export/import.
	 *
	 * @since 1.5.0
	 * @access protected
	 *
	 * @param array  $content A set of elements.
	 * @param string $method  Accepts either `on_export` to export data or
	 *                        `on_import` to import data.
	 *
	 * @return mixed Processed content data.
	 */
	protected function process_export_import_content( $content, $method ) {
		return Plugin::$instance->db->iterate_data(
			$content, function( $element_data ) use ( $method ) {
				$element = Plugin::$instance->elements_manager->create_element_instance( $element_data );

				// If the widget/element isn't exist, like a plugin that creates a widget but deactivated
				if ( ! $element ) {
					return null;
				}

				return $this->process_element_export_import_content( $element, $method );
			}
		);
	}

	/**
	 * Process single element content for export/import.
	 *
	 * Process any given element and prepare the element data for export/import.
	 *
	 * @since 1.5.0
	 * @access protected
	 *
	 * @param Controls_Stack $element
	 * @param string         $method
	 *
	 * @return array Processed element data.
	 */
	protected function process_element_export_import_content( Controls_Stack $element, $method ) {
		$element_data = $element->get_data();

		if ( method_exists( $element, $method ) ) {
			// TODO: Use the internal element data without parameters.
			$element_data = $element->{$method}( $element_data );
		}

		foreach ( $element->get_controls() as $control ) {
			$control_class = Plugin::$instance->controls_manager->get_control( $control['type'] );

			// If the control isn't exist, like a plugin that creates the control but deactivated.
			if ( ! $control_class ) {
				return $element_data;
			}

			if ( method_exists( $control_class, $method ) ) {
				$element_data['settings'][ $control['name'] ] = $control_class->{$method}( $element->get_settings( $control['name'] ), $control );
			}

			// On Export, check if the control has an argument 'export' => false.
			if ( 'on_export' === $method && isset( $control['export'] ) && false === $control['export'] ) {
				unset( $element_data['settings'][ $control['name'] ] );
			}
		}

		return $element_data;
	}

	public function get_item_children( array $args = [] ) {
		return [];
	}

	public function search_templates( array $args = [] ) {
		return [];
	}

	public function save_folder( array $folder_data = [] ) {
		return new \WP_Error( 'template_error', 'Folders cannot be created in this source' );
	}

	/**
	 * Send file headers.
	 *
	 * Set the file header when export template data to a file.
	 *
	 * @since 1.6.0
	 * @access protected
	 *
	 * @param string $file_name File name.
	 * @param int    $file_size File size.
	 */
	protected function send_file_headers( $file_name, $file_size ) {
		header( 'Content-Type: application/octet-stream' );
		header( 'Content-Disposition: attachment; filename=' . $file_name );
		header( 'Expires: 0' );
		header( 'Cache-Control: must-revalidate' );
		header( 'Pragma: public' );
		header( 'Content-Length: ' . $file_size );
	}

	protected function filesize( $path ) {
		return filesize( $path );
	}

	protected function serve_zip( $zip_complete_path ): void {
		@ob_end_flush();
		@readfile( $zip_complete_path );
	}

	protected function serve_file( string $file_content ): void {
		@ob_end_clean();
		flush();

		// PHPCS - Export widget json
		echo $file_content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	}
}
