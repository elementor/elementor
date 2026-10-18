<?php

namespace Elementor\Modules\DataFlow;

use Elementor\Modules\DataFlow\Props\Action_Call_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Custom actions are JavaScript functions written by administrators (through MCP). The code is stored in a
 * hidden post type and published as a static file under uploads that registers the function by name, so pages
 * load it by `src` (no inline or evaluated code) and only when an element references it. Element data never
 * holds code, only `{ name, args }`.
 */
class Custom_Actions {
	const POST_TYPE = 'elementor_action';
	const META_NAME = '_elementor_action_name';
	const META_ARGS = '_elementor_action_args';
	const META_FILE = '_elementor_action_file';
	const UPLOADS_DIR = 'elementor/actions';
	const MAX_CODE_LENGTH = 20000;
	const SCRIPT_HANDLE_PREFIX = 'elementor-action-';
	const RESERVED_NAMESPACES = [ 'state', 'class', 'element', 'attribute', 'animation' ];

	private static ?self $instance = null;

	private ?array $definitions = null;

	public static function instance(): self {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	public static function reset(): void {
		self::$instance = null;
	}

	public static function can_current_user_manage(): bool {
		return current_user_can( 'manage_options' ) && current_user_can( 'unfiltered_html' );
	}

	public static function register_post_type(): void {
		register_post_type( self::POST_TYPE, [
			'label' => esc_html__( 'Elementor Actions', 'elementor' ),
			'public' => false,
			'show_ui' => false,
			'show_in_rest' => false,
			'rewrite' => false,
			'query_var' => false,
			'supports' => [ 'title', 'editor', 'revisions' ],
			'capability_type' => 'post',
			'capabilities' => [
				'create_posts' => 'manage_options',
			],
			'map_meta_cap' => true,
		] );
	}

	/**
	 * @return array<string, array{label: string, description: string, args: array, script: string}>
	 */
	public function get_definitions(): array {
		if ( null !== $this->definitions ) {
			return $this->definitions;
		}

		$this->definitions = [];

		foreach ( $this->query_posts() as $post ) {
			$name = get_post_meta( $post->ID, self::META_NAME, true );

			if ( ! $name ) {
				continue;
			}

			$this->definitions[ $name ] = [
				'label' => $post->post_title,
				'description' => $post->post_excerpt,
				'args' => Actions_Registry::args_from_declaration( $this->get_args_declaration( $post->ID ) ),
				'script' => self::SCRIPT_HANDLE_PREFIX . sanitize_key( str_replace( '/', '-', $name ) ),
			];
		}

		return $this->definitions;
	}

	/**
	 * @return array{name: string, label: string, description: string, args: array, code: string}|null
	 */
	public function get( string $name ): ?array {
		$post = $this->find_post( $name );

		if ( ! $post ) {
			return null;
		}

		return [
			'name' => $name,
			'label' => $post->post_title,
			'description' => $post->post_excerpt,
			'args' => $this->get_args_declaration( $post->ID ),
			'code' => $post->post_content,
		];
	}

	public function list(): array {
		return array_values( array_map( function ( $post ) {
			return [
				'name' => get_post_meta( $post->ID, self::META_NAME, true ),
				'label' => $post->post_title,
				'description' => $post->post_excerpt,
				'args' => $this->get_args_declaration( $post->ID ),
			];
		}, $this->query_posts() ) );
	}

	/**
	 * @param array{name: string, label?: string, description?: string, args?: array, code: string} $input
	 *        `code` is a function expression receiving `{ args, element, store, event, value }`.
	 *
	 * @return array|\WP_Error The saved action.
	 */
	public function save( array $input ) {
		if ( ! self::can_current_user_manage() ) {
			return new \WP_Error( 'forbidden', __( 'Only administrators who can publish unfiltered HTML can manage actions.', 'elementor' ), [ 'status' => 403 ] );
		}

		$validation = $this->validate_definition( $input );

		if ( is_wp_error( $validation ) ) {
			return $validation;
		}

		$name = $input['name'];
		$code = $input['code'];
		$args = $this->sanitize_args_declaration( $input['args'] ?? [] );
		$existing = $this->find_post( $name );

		$post_id = wp_insert_post( wp_slash( [
			'ID' => $existing ? $existing->ID : 0,
			'post_type' => self::POST_TYPE,
			'post_status' => 'publish',
			'post_title' => sanitize_text_field( $input['label'] ?? $name ),
			'post_excerpt' => sanitize_textarea_field( $input['description'] ?? '' ),
			'post_content' => $code,
		] ), true );

		if ( is_wp_error( $post_id ) ) {
			return $post_id;
		}

		update_post_meta( $post_id, self::META_NAME, $name );
		update_post_meta( $post_id, self::META_ARGS, wp_slash( wp_json_encode( $args ) ) );

		$file = $this->write_file( $name, $code, $existing ? get_post_meta( $existing->ID, self::META_FILE, true ) : '' );

		if ( is_wp_error( $file ) ) {
			return $file;
		}

		update_post_meta( $post_id, self::META_FILE, $file );
		$this->flush();

		return $this->get( $name );
	}

	/**
	 * @return true|\WP_Error
	 */
	public function delete( string $name ) {
		if ( ! self::can_current_user_manage() ) {
			return new \WP_Error( 'forbidden', __( 'Only administrators who can publish unfiltered HTML can manage actions.', 'elementor' ), [ 'status' => 403 ] );
		}

		$post = $this->find_post( $name );

		if ( ! $post ) {
			return new \WP_Error( 'not_found', __( 'Action not found.', 'elementor' ), [ 'status' => 404 ] );
		}

		$this->delete_file( get_post_meta( $post->ID, self::META_FILE, true ) );
		wp_delete_post( $post->ID, true );
		$this->flush();

		return true;
	}

	public function register_scripts( string $runtime_handle ): void {
		foreach ( $this->query_posts() as $post ) {
			$name = get_post_meta( $post->ID, self::META_NAME, true );
			$file = get_post_meta( $post->ID, self::META_FILE, true );

			if ( ! $name || ! $file ) {
				continue;
			}

			wp_register_script(
				self::SCRIPT_HANDLE_PREFIX . sanitize_key( str_replace( '/', '-', $name ) ),
				$this->get_uploads_url() . '/' . $file,
				[ $runtime_handle ],
				null,
				true
			);
		}
	}

	/**
	 * Registers a valid definition for the current request only, without saving it, so a dry run can validate
	 * element actions that reference it.
	 *
	 * @return true|\WP_Error
	 */
	public function preview( array $input ) {
		$validation = $this->validate_definition( $input );

		if ( is_wp_error( $validation ) ) {
			return $validation;
		}

		Actions_Registry::instance()->register( $input['name'], [
			'label' => sanitize_text_field( $input['label'] ?? $input['name'] ),
			'args' => Actions_Registry::args_from_declaration( $this->sanitize_args_declaration( $input['args'] ?? [] ) ),
		], Actions_Registry::SOURCE_CUSTOM );

		return true;
	}

	/**
	 * @return true|\WP_Error
	 */
	public function validate_definition( array $input ) {
		$name = $input['name'] ?? '';
		$code = $input['code'] ?? '';

		if ( ! is_string( $name ) || ! is_string( $code ) ) {
			return new \WP_Error( 'invalid_input', __( 'Custom actions need a name and code.', 'elementor' ), [ 'status' => 400 ] );
		}

		if ( ! preg_match( Action_Call_Prop_Type::NAME_PATTERN, $name ) ) {
			return new \WP_Error( 'invalid_name', __( 'Action names look like "namespace/action" using lowercase letters, numbers and dashes.', 'elementor' ), [ 'status' => 400 ] );
		}

		if ( in_array( strtok( $name, '/' ), self::RESERVED_NAMESPACES, true ) ) {
			return new \WP_Error( 'reserved_name', __( 'This namespace is reserved for built-in actions.', 'elementor' ), [ 'status' => 400 ] );
		}

		if ( '' === trim( $code ) || strlen( $code ) > self::MAX_CODE_LENGTH ) {
			return new \WP_Error( 'invalid_code', __( 'Code is required and limited to 20,000 characters.', 'elementor' ), [ 'status' => 400 ] );
		}

		if ( false !== stripos( $code, '</script' ) ) {
			return new \WP_Error( 'invalid_code', __( 'Code must not contain a closing script tag.', 'elementor' ), [ 'status' => 400 ] );
		}

		return true;
	}

	private function sanitize_args_declaration( $declaration ): array {
		if ( ! is_array( $declaration ) ) {
			return [];
		}

		$sanitized = [];

		foreach ( $declaration as $key => $arg ) {
			$type = is_array( $arg ) ? ( $arg['type'] ?? null ) : $arg;

			if ( ! is_string( $key ) || ! preg_match( State_Params::KEY_PATTERN, $key ) || ! in_array( $type, Actions_Registry::ARG_TYPES, true ) ) {
				continue;
			}

			$sanitized[ $key ] = [
				'type' => $type,
				'label' => sanitize_text_field( is_array( $arg ) ? ( $arg['label'] ?? $key ) : $key ),
			];
		}

		return $sanitized;
	}

	private function get_args_declaration( int $post_id ): array {
		$args = json_decode( (string) get_post_meta( $post_id, self::META_ARGS, true ), true );

		return is_array( $args ) ? $args : [];
	}

	/**
	 * @return string|\WP_Error The file path relative to the uploads base.
	 */
	private function write_file( string $name, string $code, string $previous_file ) {
		$dir = $this->get_uploads_dir();

		if ( ! wp_mkdir_p( $dir ) ) {
			return new \WP_Error( 'write_failed', __( 'Could not create the actions folder in uploads.', 'elementor' ), [ 'status' => 500 ] );
		}

		$contents = sprintf(
			"/* Elementor custom action: %1\$s */\n(function () {\n\t'use strict';\n\twindow.elementorActions.register( %2\$s, (\n%3\$s\n\t) );\n})();\n",
			str_replace( '*/', '', $name ),
			wp_json_encode( $name ),
			$code
		);

		$file_name = sanitize_file_name( str_replace( '/', '--', $name ) . '-' . substr( md5( $contents ), 0, 10 ) . '.js' );

		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
		if ( false === file_put_contents( $dir . '/' . $file_name, $contents ) ) {
			return new \WP_Error( 'write_failed', __( 'Could not write the action file.', 'elementor' ), [ 'status' => 500 ] );
		}

		if ( $previous_file && basename( $previous_file ) !== $file_name ) {
			$this->delete_file( $previous_file );
		}

		return self::UPLOADS_DIR . '/' . $file_name;
	}

	private function delete_file( $file ): void {
		if ( ! $file ) {
			return;
		}

		$path = wp_upload_dir()['basedir'] . '/' . self::UPLOADS_DIR . '/' . basename( $file );

		if ( file_exists( $path ) ) {
			wp_delete_file( $path );
		}
	}

	private function get_uploads_dir(): string {
		return wp_upload_dir()['basedir'] . '/' . self::UPLOADS_DIR;
	}

	private function get_uploads_url(): string {
		return set_url_scheme( wp_upload_dir()['baseurl'] );
	}

	private function find_post( string $name ): ?\WP_Post {
		$posts = get_posts( [
			'post_type' => self::POST_TYPE,
			'post_status' => 'publish',
			'posts_per_page' => 1,
			// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
			'meta_query' => [
				[
					'key' => self::META_NAME,
					'value' => $name,
				],
			],
		] );

		return $posts[0] ?? null;
	}

	private function query_posts(): array {
		if ( ! post_type_exists( self::POST_TYPE ) ) {
			return [];
		}

		return get_posts( [
			'post_type' => self::POST_TYPE,
			'post_status' => 'publish',
			'posts_per_page' => 100,
			'orderby' => 'title',
			'order' => 'ASC',
		] );
	}

	private function flush(): void {
		$this->definitions = null;
		Actions_Registry::reset();
	}
}
