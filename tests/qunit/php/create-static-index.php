<?php

require __DIR__ . '/load-wp.php';

$_REQUEST['post'] = $post_id;
$_REQUEST['action'] = 'elementor';

ob_start();

\Elementor\Plugin::$instance->editor->init( false );

$html = ob_get_clean();

$html = str_replace( home_url(), '../../../../../', $html );
$html = str_replace( wp_json_encode( add_query_arg( 'elementor-preview', '', get_permalink( $_REQUEST['post'] ) ) ), '"./preview.html?"', $html );

$quint = '<div id="qunit" style="z-index: 1;position: relative;"></div><div id="qunit-fixture"></div><link rel="stylesheet" href="https://code.jquery.com/qunit/qunit-2.4.0.css"><script src="https://code.jquery.com/qunit/qunit-2.4.0.js"></script><script src="tests.js"></script>';

$html = str_replace( '</body>', $quint . '</body>', $html );

file_put_contents( __DIR__ . '/../index.html', $html );
