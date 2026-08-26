<?php
namespace Elementor\Core\Files;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Base {

	const UPLOADS_DIR = 'elementor/';

	const DEFAULT_FILES_DIR = 'css/';

	const META_KEY = '';

	private static $wp_uploads_dir = [];

	private $files_dir;

	private $file_name;

	/**
	 * File path.
	 *
	 * Holds the file path.
	 *
	 * @access private
	 *
	 * @var string
	 */
	private $path;

	/**
	 * Content.
	 *
	 * Holds the file content.
	 *
	 * @access private
	 *
	 * @var string
	 */
	private $content;

	/**
	 * @since 2.1.0
	 * @access public
	 * @static
	 */
	public static function get_base_uploads_dir() {
		$wp_upload_dir = self::get_wp_uploads_dir();
		$dir = $wp_upload_dir['basedir'] . '/' . self::UPLOADS_DIR;

		if ( ! self::is_optimized_css_files_active() ) {
			return $dir;
		}

		if ( ! self::is_base_paths_filter_pair_valid() ) {
			return $dir;
		}

		/**
		 * Elementor files base directory.
		 *
		 * Filters the absolute filesystem path of the Elementor files base directory.
		 * Applies to all `Elementor\Core\Files\Base` consumers (Post CSS, Global CSS,
		 * Frontend CSS, Google Fonts, atomic CSS, etc.) — not only atomic CSS.
		 *
		 * Must be set together with `elementor/files/base_url`. Setting only one of the
		 * two is rejected and both fall back to their defaults.
		 *
		 * Only available when the `e_optimized_css_files` experiment is active.
		 *
		 * @since 4.4.0
		 *
		 * @param string $dir Absolute filesystem path to the Elementor files base directory.
		 */
		$filtered_dir = apply_filters( 'elementor/files/base_dir', $dir );

		$validated_dir = self::validate_base_dir( $filtered_dir );

		return null !== $validated_dir ? $validated_dir : $dir;
	}

	/**
	 * @since 2.1.0
	 * @access public
	 * @static
	 */
	public static function get_base_uploads_url() {
		$wp_upload_dir = self::get_wp_uploads_dir();
		$url = $wp_upload_dir['baseurl'] . '/' . self::UPLOADS_DIR;

		if ( ! self::is_optimized_css_files_active() ) {
			return $url;
		}

		if ( ! self::is_base_paths_filter_pair_valid() ) {
			return $url;
		}

		/**
		 * Elementor files base URL.
		 *
		 * Filters the public URL of the Elementor files base directory.
		 * Applies to all `Elementor\Core\Files\Base` consumers (Post CSS, Global CSS,
		 * Frontend CSS, Google Fonts, atomic CSS, etc.) — not only atomic CSS.
		 *
		 * Must be set together with `elementor/files/base_dir`. Setting only one of the
		 * two is rejected and both fall back to their defaults.
		 *
		 * Only available when the `e_optimized_css_files` experiment is active.
		 *
		 * @since 4.4.0
		 *
		 * @param string $url Public URL for the Elementor files base directory.
		 */
		$filtered_url = apply_filters( 'elementor/files/base_url', $url );

		$validated_url = self::validate_base_url( $filtered_url );

		return null !== $validated_url ? $validated_url : $url;
	}

	/**
	 * Use a create function for PhpDoc (@return static).
	 *
	 * @return static
	 */
	public static function create() {
		return Plugin::$instance->files_manager->get( get_called_class(), func_get_args() );
	}

	/**
	 * @since 2.1.0
	 * @access public
	 */
	public function __construct( $file_name ) {
		/**
		 * Elementor File Name
		 *
		 * Filters the File name
		 *
		 * @since 2.3.0
		 *
		 * @param string   $file_name
		 * @param object $this The file instance, which inherits Elementor\Core\Files
		 */
		$file_name = apply_filters( 'elementor/files/file_name', $file_name, $this );

		$this->set_file_name( $file_name );

		$this->set_files_dir( static::DEFAULT_FILES_DIR );

		$this->set_path();
	}

	/**
	 * @since 2.1.0
	 * @access public
	 */
	public function set_files_dir( $files_dir ) {
		$this->files_dir = $files_dir;
	}

	/**
	 * @since 2.1.0
	 * @access public
	 */
	public function set_file_name( $file_name ) {
		$this->file_name = $file_name;
	}

	/**
	 * @since 2.1.0
	 * @access public
	 */
	public function get_file_name() {
		return $this->file_name;
	}

	/**
	 * @since 2.1.0
	 * @access public
	 */
	public function get_url() {
		$url = set_url_scheme( self::get_base_uploads_url() . $this->files_dir . $this->file_name );

		return add_query_arg( [ 'ver' => $this->get_meta( 'time' ) ], $url );
	}

	/**
	 * Get Path
	 *
	 * Returns the local path of the generated file.
	 *
	 * @since 3.5.0
	 * @access public
	 *
	 * @return string
	 */
	public function get_path() {
		return set_url_scheme( self::get_base_uploads_dir() . $this->files_dir . $this->file_name );
	}

	/**
	 * @since 2.1.0
	 * @access public
	 */
	public function get_content() {
		if ( ! $this->content ) {
			$this->content = $this->parse_content();
		}

		return $this->content;
	}

	/**
	 * @since 2.1.0
	 * @access public
	 */
	public function update() {
		$this->update_file();

		$meta = $this->get_meta();

		$meta['time'] = time();

		$this->update_meta( $meta );
	}

	/**
	 * @since 2.1.0
	 * @access public
	 */
	public function update_file() {
		$this->content = $this->parse_content();

		if ( $this->content ) {
			$this->write();
		} else {
			$this->delete();
		}
	}

	/**
	 * @since 2.1.0
	 * @access public
	 */
	public function write() {
		return file_put_contents( $this->path, $this->content );
	}

	/**
	 * @since 2.1.0
	 * @access public
	 */
	public function delete() {
		if ( file_exists( $this->path ) ) {
			unlink( $this->path );
		}

		$this->delete_meta();
	}

	/**
	 * Get meta data.
	 *
	 * Retrieve the CSS file meta data. Returns an array of all the data, or if
	 * custom property is given it will return the property value, or `null` if
	 * the property does not exist.
	 *
	 * @since 2.1.0
	 * @access public
	 *
	 * @param string $property Optional. Custom meta data property. Default is
	 *                         null.
	 *
	 * @return array|null An array of all the data, or if custom property is
	 *                    given it will return the property value, or `null` if
	 *                    the property does not exist.
	 */
	public function get_meta( $property = null ) {
		$meta = array_merge( $this->get_default_meta(), (array) $this->load_meta() );

		if ( $property ) {
			return isset( $meta[ $property ] ) ? $meta[ $property ] : null;
		}

		return $meta;
	}

	/**
	 * @since 2.1.0
	 * @access protected
	 * @abstract
	 */
	abstract protected function parse_content();

	/**
	 * Load meta.
	 *
	 * Retrieve the file meta data.
	 *
	 * @since 2.1.0
	 * @access protected
	 */
	protected function load_meta() {
		return get_option( static::META_KEY );
	}

	/**
	 * Update meta.
	 *
	 * Update the file meta data.
	 *
	 * @since 2.1.0
	 * @access protected
	 *
	 * @param array $meta New meta data.
	 */
	protected function update_meta( $meta ) {
		update_option( static::META_KEY, $meta );
	}

	/**
	 * Delete meta.
	 *
	 * Delete the file meta data.
	 *
	 * @since 2.1.0
	 * @access protected
	 */
	protected function delete_meta() {
		delete_option( static::META_KEY );
	}

	/**
	 * @since 2.1.0
	 * @access protected
	 */
	protected function get_default_meta() {
		return [
			'time' => 0,
		];
	}

	/**
	 * @since 2.1.0
	 * @access private
	 * @static
	 */
	private static function get_wp_uploads_dir() {
		global $blog_id;
		if ( empty( self::$wp_uploads_dir[ $blog_id ] ) ) {
			self::$wp_uploads_dir[ $blog_id ] = wp_upload_dir( null, false );
		}

		return self::$wp_uploads_dir[ $blog_id ];
	}

	/**
	 * Whether the "Optimized CSS Files" experiment is active.
	 *
	 * @since 4.4.0
	 * @access private
	 * @static
	 *
	 * @return bool
	 */
	private static function is_optimized_css_files_active() {
		return Plugin::$instance->experiments->is_feature_active( 'e_optimized_css_files' );
	}

	/**
	 * Ensure `elementor/files/base_dir` and `elementor/files/base_url` are either both
	 * filtered or both unfiltered. Setting only one produces a mismatched write vs.
	 * enqueue location and yields 404s for every generated asset.
	 *
	 * @since 4.4.0
	 * @access private
	 * @static
	 *
	 * @return bool True when the pair is safe to apply (both set or both unset).
	 */
	private static function is_base_paths_filter_pair_valid() {
		$has_dir_filter = (bool) has_filter( 'elementor/files/base_dir' );
		$has_url_filter = (bool) has_filter( 'elementor/files/base_url' );

		if ( $has_dir_filter === $has_url_filter ) {
			return true;
		}

		_doing_it_wrong(
			__METHOD__,
			'The `elementor/files/base_dir` and `elementor/files/base_url` filters must be set together. Falling back to defaults.',
			'4.4.0'
		);

		return false;
	}

	/**
	 * Validate a filtered base directory path.
	 *
	 * @since 4.4.0
	 * @access private
	 * @static
	 *
	 * @param mixed $dir Candidate base directory path.
	 *
	 * @return string|null Normalized path on success, or null to fall back to the default.
	 */
	private static function validate_base_dir( $dir ) {
		if ( ! is_string( $dir ) || '' === $dir ) {
			_doing_it_wrong(
				__METHOD__,
				'The `elementor/files/base_dir` filter must return a non-empty string.',
				'4.4.0'
			);

			return null;
		}

		$dir = trailingslashit( wp_normalize_path( $dir ) );

		if ( ! self::is_absolute_path( $dir ) ) {
			_doing_it_wrong(
				__METHOD__,
				'The `elementor/files/base_dir` filter must return an absolute filesystem path.',
				'4.4.0'
			);

			return null;
		}

		if ( self::path_contains_traversal( $dir ) ) {
			_doing_it_wrong(
				__METHOD__,
				'The `elementor/files/base_dir` filter must not contain path traversal segments.',
				'4.4.0'
			);

			return null;
		}

		if ( ! self::is_path_within_allowed_roots( $dir ) ) {
			_doing_it_wrong(
				__METHOD__,
				'The `elementor/files/base_dir` filter must resolve inside `WP_CONTENT_DIR` or the uploads basedir.',
				'4.4.0'
			);

			return null;
		}

		return $dir;
	}

	/**
	 * Validate a filtered base URL.
	 *
	 * @since 4.4.0
	 * @access private
	 * @static
	 *
	 * @param mixed $url Candidate base URL.
	 *
	 * @return string|null Normalized URL on success, or null to fall back to the default.
	 */
	private static function validate_base_url( $url ) {
		if ( ! is_string( $url ) || '' === $url ) {
			_doing_it_wrong(
				__METHOD__,
				'The `elementor/files/base_url` filter must return a non-empty string.',
				'4.4.0'
			);

			return null;
		}

		$url = trailingslashit( $url );

		if ( ! wp_http_validate_url( $url ) ) {
			_doing_it_wrong(
				__METHOD__,
				'The `elementor/files/base_url` filter must return a valid URL.',
				'4.4.0'
			);

			return null;
		}

		return $url;
	}

	/**
	 * @since 4.4.0
	 * @access private
	 * @static
	 *
	 * @param string $path Filesystem path.
	 *
	 * @return bool
	 */
	private static function is_absolute_path( $path ) {
		if ( wp_is_stream( $path ) ) {
			return true;
		}

		$path = wp_normalize_path( $path );

		return isset( $path[0] ) && ( '/' === $path[0] || preg_match( '#^[a-zA-Z]:/#', $path ) );
	}

	/**
	 * @since 4.4.0
	 * @access private
	 * @static
	 *
	 * @param string $path Filesystem path.
	 *
	 * @return bool
	 */
	private static function path_contains_traversal( $path ) {
		$parts = explode( '/', wp_normalize_path( untrailingslashit( $path ) ) );

		return in_array( '..', $parts, true );
	}

	/**
	 * @since 4.4.0
	 * @access private
	 * @static
	 *
	 * @param string $path Filesystem path.
	 *
	 * @return bool
	 */
	private static function is_path_within_allowed_roots( $path ) {
		if ( defined( 'ELEMENTOR_FILES_ALLOW_EXTERNAL_BASE_DIR' ) && ELEMENTOR_FILES_ALLOW_EXTERNAL_BASE_DIR ) {
			return true;
		}

		$resolved_path = self::resolve_deepest_existing( $path );

		if ( false === $resolved_path ) {
			return false;
		}

		$uploads_basedir = self::get_wp_uploads_dir()['basedir'];
		$allowed_roots = array_filter( [
			self::resolve_deepest_existing( WP_CONTENT_DIR ),
			self::resolve_deepest_existing( $uploads_basedir ),
		] );

		foreach ( $allowed_roots as $root ) {
			if ( $resolved_path === $root || 0 === strpos( $resolved_path, $root . '/' ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Resolve the realpath of the deepest existing ancestor of `$path`.
	 *
	 * Non-existent targets are common when a host sets the filter to a directory
	 * that Elementor will create on first write. Walking up to the deepest existing
	 * ancestor lets us still resolve symlinks and reject paths whose real location
	 * escapes the allowed roots.
	 *
	 * @since 4.4.0
	 * @access private
	 * @static
	 *
	 * @param string $path Filesystem path.
	 *
	 * @return string|false Normalized realpath, or false if none could be resolved.
	 */
	private static function resolve_deepest_existing( $path ) {
		$current = wp_normalize_path( untrailingslashit( (string) $path ) );

		while ( '' !== $current && ! file_exists( $current ) ) {
			$parent = wp_normalize_path( dirname( $current ) );

			if ( $parent === $current ) {
				return false;
			}

			$current = $parent;
		}

		if ( '' === $current ) {
			return false;
		}

		$real = realpath( $current );

		return $real ? untrailingslashit( wp_normalize_path( $real ) ) : false;
	}

	/**
	 * @since 2.1.0
	 * @access private
	 */
	private function set_path() {
		$dir_path = self::get_base_uploads_dir() . $this->files_dir;

		if ( ! is_dir( $dir_path ) ) {
			wp_mkdir_p( $dir_path );
		}

		$this->path = $dir_path . $this->file_name;
	}
}
