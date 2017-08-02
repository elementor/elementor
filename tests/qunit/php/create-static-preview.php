<?php

require __DIR__ . '/load-wp.php';

$GLOBALS['post'] = get_post( $post_id );
$_GET['elementor-preview'] = 1;

define( 'WP_USE_THEMES', true );

query_posts( [ 'p' => $post_id, 'post_type' => 'any' ] );

\Elementor\Plugin::$instance->preview->init();

// Load the theme template.
$template = get_index_template();
$template = apply_filters( 'template_include', $template );

ob_start();

require $template;

$html = ob_get_clean();

$html = str_replace( home_url(), '../../../../../', $html );

$quint = '<script src="vendor/j-ulrich/jquery-simulate-ext/jquery.simulate.js"></script>
<script src="vendor/j-ulrich/jquery-simulate-ext/jquery.simulate.ext.js"></script>
<script src="vendor/j-ulrich/jquery-simulate-ext/jquery.simulate.drag-n-drop.js"></script>';

$html = str_replace( '</body>', $quint . '</body>', $html );

file_put_contents( __DIR__ . '/../preview.html', $html );



