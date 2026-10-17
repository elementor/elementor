<?php

namespace Elementor\Modules\DataFlow\Snippets;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Snippet_Store {
	const POST_TYPE = 'elementor_snippet';
	const UPLOAD_DIRECTORY = 'elementor/snippets';
	const META_HANDLERS = '_e_snippet_handlers';
	const META_FILE = '_e_snippet_file';
	const HASH_LENGTH = 12;

	public static function register_post_type(): void {
		register_post_type( self::POST_TYPE, [
			'public' => false,
			'show_ui' => false,
			'show_in_rest' => false,
			'rewrite' => false,
			'query_var' => false,
			'can_export' => false,
			'supports' => [ 'title' ],
		] );
	}

	public static function save( string $name, array $handlers ) {
		$post_id = self::find_post_id( $name ) ?: wp_insert_post( [
			'post_type' => self::POST_TYPE,
			'post_status' => 'publish',
			'post_title' => $name,
			'post_name' => $name,
		], true );

		if ( is_wp_error( $post_id ) ) {
			return $post_id;
		}

		$file_name = self::publish_file( $name, $handlers );

		if ( is_wp_error( $file_name ) ) {
			return $file_name;
		}

		update_post_meta( $post_id, self::META_HANDLERS, wp_slash( wp_json_encode( $handlers ) ) );
		update_post_meta( $post_id, self::META_FILE, $file_name );

		return self::get( $name );
	}

	public static function get( string $name ): ?array {
		$post_id = self::find_post_id( $name );

		if ( ! $post_id ) {
			return null;
		}

		$handlers = json_decode( (string) get_post_meta( $post_id, self::META_HANDLERS, true ), true );
		$file_name = (string) get_post_meta( $post_id, self::META_FILE, true );

		return [
			'name' => $name,
			'handlers' => is_array( $handlers ) ? $handlers : [],
			'url' => '' === $file_name ? '' : self::get_directory()['url'] . '/' . $file_name,
			'version' => $file_name,
		];
	}

	public static function all(): array {
		$post_ids = get_posts( [
			'post_type' => self::POST_TYPE,
			'post_status' => 'publish',
			'posts_per_page' => -1,
			'fields' => 'ids',
			'orderby' => 'title',
			'order' => 'ASC',
		] );

		return array_values( array_filter( array_map( fn( $post_id ) => self::get( get_post_field( 'post_name', $post_id ) ), $post_ids ) ) );
	}

	public static function delete( string $name ): bool {
		$post_id = self::find_post_id( $name );

		if ( ! $post_id ) {
			return false;
		}

		self::delete_files( $name );

		return false !== wp_delete_post( $post_id, true );
	}

	private static function find_post_id( string $name ): int {
		$posts = get_posts( [
			'post_type' => self::POST_TYPE,
			'post_status' => 'publish',
			'name' => $name,
			'posts_per_page' => 1,
			'fields' => 'ids',
		] );

		return (int) ( $posts[0] ?? 0 );
	}

	private static function publish_file( string $name, array $handlers ) {
		$directory = self::get_directory();

		if ( ! wp_mkdir_p( $directory['path'] ) ) {
			return new \WP_Error( 'snippet_storage_unavailable', 'The snippets directory is not writable.' );
		}

		$javascript = Snippet_Wrapper::wrap( $name, $handlers );
		$file_name = $name . '-' . substr( md5( $javascript ), 0, self::HASH_LENGTH ) . '.js';

		self::delete_files( $name );

		// PHPCS - Generated, validated snippet code is written to a static file in the uploads directory.
		$written = file_put_contents( $directory['path'] . '/' . $file_name, $javascript ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents

		if ( false === $written ) {
			return new \WP_Error( 'snippet_storage_unavailable', 'The snippet file could not be written.' );
		}

		return $file_name;
	}

	private static function delete_files( string $name ): void {
		foreach ( glob( self::get_directory()['path'] . '/' . $name . '-*.js' ) ?: [] as $file ) {
			if ( 1 === preg_match( '/^' . preg_quote( $name, '/' ) . '-[a-f0-9]{' . self::HASH_LENGTH . '}\.js$/', basename( $file ) ) ) {
				wp_delete_file( $file );
			}
		}
	}

	private static function get_directory(): array {
		$uploads = wp_upload_dir();

		return [
			'path' => $uploads['basedir'] . '/' . self::UPLOAD_DIRECTORY,
			'url' => $uploads['baseurl'] . '/' . self::UPLOAD_DIRECTORY,
		];
	}
}
