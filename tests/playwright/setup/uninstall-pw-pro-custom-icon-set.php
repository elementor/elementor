<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$library_title = 'PW Fontello';
$posts = get_posts(
	[
		'post_type' => 'elementor_icons',
		'post_status' => 'any',
		'numberposts' => -1,
	]
);

foreach ( $posts as $post ) {
	if ( $library_title !== $post->post_title ) {
		continue;
	}

	$uploads = wp_upload_dir();
	$pack_dir = trailingslashit( $uploads['basedir'] ) . 'elementor/custom-icons/' . $post->ID;

	if ( is_dir( $pack_dir ) ) {
		$iterator = new RecursiveIteratorIterator(
			new RecursiveDirectoryIterator( $pack_dir, FilesystemIterator::SKIP_DOTS ),
			RecursiveIteratorIterator::CHILD_FIRST
		);

		foreach ( $iterator as $file ) {
			$file->isDir() ? rmdir( $file->getPathname() ) : unlink( $file->getPathname() );
		}

		rmdir( $pack_dir );
	}

	wp_delete_post( $post->ID, true );
}
