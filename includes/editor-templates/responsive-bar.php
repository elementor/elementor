<?php

namespace Elementor;

use Elementor\Core\Breakpoints\Breakpoint;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

// TODO: Use API data instead of this static array, once it is available.
$active_breakpoints = Plugin::$instance->breakpoints->get_active_breakpoints();
$active_devices = Plugin::$instance->breakpoints->get_active_devices_list( [ 'reverse' => true ] );

$breakpoint_classes_map = array_intersect_key( Plugin::$instance->breakpoints->get_responsive_icons_classes_map(), array_flip( $active_devices ) );

/* translators: %1$s: Device Name */
$breakpoint_label = esc_html__( '%1$s <br> Settings added for the %1$s device will apply to %2$spx screens and down', 'elementor' );
?>

<script type="text/template" id="tmpl-elementor-templates-responsive-bar">
	<div id="e-responsive-bar__start">
		<div id="elementor-panel-footer-logo" class="elementor-panel-footer-tool elementor-toggle-state">
			<div class="e-responsive-bar__menu">
				<div class="e-responsive-bar__menu-logo">
					<span class="e-responsive-bar__menu-logo-fragment e-responsive-bar__menu-logo-fragment--vertical"></span>
					<span class="e-responsive-bar__menu-logo-fragment"></span>
					<span class="e-responsive-bar__menu-logo-fragment"></span>
					<span class="e-responsive-bar__menu-logo-fragment"></span>
				</div>
			</div>
			<span class="elementor-screen-only"><?php echo esc_html__( 'Elementor Logo', 'elementor' ); ?></span>
			<div class="elementor-panel-footer-sub-menu">
				<div id="elementor-panel-footer-sub-menu-item-theme-builder" class="elementor-panel-footer-sub-menu-item">
					<!-- <i class="elementor-icon eicon-save" aria-hidden="true"></i> -->
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
						<rect width="16" height="16" fill="url(#pattern11)"/>
						<defs>
						<pattern id="pattern11" patternContentUnits="objectBoundingBox" width="1" height="1">
						<use xlink:href="#image11" transform="scale(0.0416667)"/>
						</pattern>
						<image id="image11" width="24" height="24" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAAkUlEQVRIie2VQQqAIBAAx+hV0QOM/v+B7B91KCF01dTCQw1IQtvujobCTyYzsAJb4TDAFCtgKpLbscQK2KABGIX5llgBL6YLBHaAEubZuB+mOszOGzJ4jD7VQSbeCjQzsEh7ooR3QePmBsW/p6W5QWwPbtHcINbtLZPXDdwC5nyWHtXXHCKa4zyvuQt0geiX2QFcwk8UY6n2dAAAAABJRU5ErkJggg=="/>
						</defs>
					</svg>
					<span class="elementor-title"><?php echo esc_html__( 'Theme Builder', 'elementor' ); ?></span>
				</div>
				<div id="elementor-panel-footer-sub-menu-item-wp-dashboard" class="elementor-panel-footer-sub-menu-item">
					<!-- <i class="elementor-icon eicon-folder" aria-hidden="true"></i> -->
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
						<rect width="16" height="16" fill="url(#pattern12)"/>
						<defs>
						<pattern id="pattern12" patternContentUnits="objectBoundingBox" width="1" height="1">
						<use xlink:href="#image12" transform="scale(0.0416667)"/>
						</pattern>
						<image id="image12" width="24" height="24" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAACUElEQVRIid3US4jIXxQH8I/HjLeFhJHXCiPFUuQxFsqG8WiksJDHhpQNZaEkzFCipMjKnwULCwvlVVhSHmUwRh7Ff6nGI/JcnPPjMsZr6Vu3373f373nnvM95x7+ddSiCcdxFy9z3E2uKff8FRbiAc5iFcahX47xWI1zaMeCPzHcHS24hxmYgL24jucZwW3sx0TMRBua8+wv0YJLGJaGP+JTF+MDDqAOl/OSn2Jhej4EF35iuByb0ReDcB+NpcFuxbwWrViJGixCB5amBDcwML3uwBKMRh+8TRsNOCRkffe9900ioWVVHMEb/I9tBX8YrzOCOQU/BuexuCLKpDTiBDahV3IPcz4MG9JbokyreQt65nxN2vhGpgr3RCneFvLIdan3kuSH433Bz0V/UWnj04FOEdThGUZiRXHprWJPpfUzUQQVemOykOhpOtAJHRggtH2LwclvSS870lAlzbIighHYI97JgNzbCZVEd/LQuuTH5vpYergx+X54ISTthsdConpdSHRNvNyLuV6e3zbcxEmRg4p/hVM4jakYJWSbgas/iqBJ9JZJotY/ZUSwPuW5nvzE5OdgGvblmfq85EuZlqgVjWsmDqah7fmvh28ralfB14ik78bsjLjmRxcQXbFNVMFFPPJVxq3FBU8KfhbO5Jl2zOvKeIVm0biGi0Y2Pfkq+dVoSH4KhuIKdvzKuPSsWTSuBiFdnaiM1yK5raJMCVnasdNvtusKjXnJedEC6sVr7S+a2VqR0DbM/xPDJWpERfwnJHqRoxVH81+XCf038BlI26d0hhBMKQAAAABJRU5ErkJggg=="/>
						</defs>
					</svg>
					<span class="elementor-title"><?php echo esc_html__( 'WP Dashboard', 'elementor' ); ?></span>
				</div>
			</div>
		</div>
		<div id="elementor-panel-footer-add-widgets" class="elementor-panel-footer-tool tooltip-target" data-tooltip="<?php esc_attr_e( 'Add Widgets', 'elementor' ); ?>">
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
				<rect width="24" height="24" fill="url(#pattern10)"/>
				<defs>
				<pattern id="pattern10" patternContentUnits="objectBoundingBox" width="1" height="1">
				<use xlink:href="#image10" transform="scale(0.0416667)"/>
				</pattern>
				<image id="image10" width="24" height="24" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAAP0lEQVRIiWNgGAXUBJMZ7P9PZrD/T4oeJlo5ZtSCUQuoBxiROaSmcVwgl+Eg3Fya+4AkMJqTRy0YphaMAoIAAIhkCmQ+a8d9AAAAAElFTkSuQmCC"/>
				</defs>
			</svg>
			<span class="elementor-screen-only"><?php echo esc_html__( 'Add Widgets', 'elementor' ); ?></span>
		</div>
		<div id="elementor-panel-footer-navigator" class="elementor-panel-footer-tool tooltip-target" data-tooltip="<?php esc_attr_e( 'Navigator', 'elementor' ); ?>">
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
				<rect width="24" height="24" fill="url(#pattern4)"/>
				<defs>
				<pattern id="pattern4" patternContentUnits="objectBoundingBox" width="1" height="1">
				<use xlink:href="#image4" transform="scale(0.0416667)"/>
				</pattern>
				<image id="image4" width="24" height="24" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAABD0lEQVRIie2VMU7EMBBF3ySIaFt3OcCKw1CupuIMuQGFJSjo09NRWdBxFFcU26VMTaRlTUFAu14HEiCIYn8Taew/fzLf9sB/gqrmqppP4ciYTdbarGmaFXAFnIrITVmWt9bazY8EosRn0fJ6jFBSQFVzY8xFCOESWPbhJxG5BkjF27a9c869fCowUPFBpWP3fQhMIUwtKAPw3ouILIBsh78Bnr33IZV8LO9vWhSjqqqi67p74HwnPGQywGNRFKu6rrs4157A0Onpv0v2EceTp2mUycA2ddGieLJVJ/BmljFmEUJImuWc2wJOVR8A3ivs/3iQd9Cio8lHk3/P5Nme6xizDZwvhCaNzEn4ztCfHa/eMGSh4ypbjgAAAABJRU5ErkJggg=="/>
				</defs>
			</svg>
			<span class="elementor-screen-only"><?php echo esc_html__( 'Navigator', 'elementor' ); ?></span>
		</div>
		<div id="elementor-panel-footer-history" class="elementor-panel-footer-tool tooltip-target" data-tooltip="<?php esc_attr_e( 'History', 'elementor' ); ?>">
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
				<rect width="24" height="24" fill="url(#pattern6)"/>
				<defs>
				<pattern id="pattern6" patternContentUnits="objectBoundingBox" width="1" height="1">
				<use xlink:href="#image6" transform="scale(0.0416667)"/>
				</pattern>
				<image id="image6" width="24" height="24" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAACrElEQVRIidWUO2gUYRDHf7PxLuADbxuLRFGiQVARSc7GwiZB7Yzg4qOM7iSKgoVPLLw2ihZBYm4PC0tZkVyhCGKrhV6qeAoiKsoJFslpEzi9Gwv3wpp7RO38V7Mzs/Obb77dgf9d0i7oeV4ylUrtE5FDwA5gHeAAn8xsGpgql8tTYRhWWtVw6oaqZuIB3/f3uq47IyJ54CiwBVgFrAA2i8gREbnrum7R9/0DSwKAK3WIqmZE5BHQC7wEzgLbOzs7V8/Pz680s21mdgaYATaKyH1VHctkMs5iwMKIVNUi8ymwC6gAF+fm5sbDMKw2687zvA7XdU8A14EkcDUIggtLAQB+AENBEDyIJ9dzgiD47e5GRkYGzOxhBDkQBMFUsxHFtQzY2SLWoGw2+0REzkaP11Q1sRQAYnfyJ5qdnZ3g131tEpH98U6BxmP/rcIwrKrqbeAGMATcg/Yn+Gs5jvMYwMzSC75/KTQ6Orqmmb9SqXyIzK4GgKp+U1UbHh5e1ab2DECtVnvSCrJY8RN8BkgkEutaJjvOQATZ1gySTCbXR2apGeAFgJntaQWYnJz8EodUq9WD8Xjs3ecNADPLR+Zxz/M6/gByMpfLTdT9nud1mNkxgGh/AbHPtFwuT7mu+xbYGv3+N9tBgFtxXyqVOsWvhfgm1iwLnRaLxWpfX9/HaDUPptPpZ4VC4V0rSFy+7w+KyB3AMbPhXC73qgEAMD09/bq/v385sBs4nE6nv/b09BSKxaLRRJlMZllvb+/pqHgCGIuPDWIjqqurq+tSqVQCOG9m467rjqjqbcdxHjuO8x6gVqttMLM9pVLpmIhsAczMxrq7uy8vrtdyPajqEHAN2NQqJ9IbETmXzWbzzYJt94+qJqLFNWRm/cDaKPQRKIhI3szyQRB8X6KJ/1g/AV35/plxdBG9AAAAAElFTkSuQmCC"/>
				</defs>
			</svg>
			<span class="elementor-screen-only"><?php echo esc_html__( 'History', 'elementor' ); ?></span>
		</div>
		<div id="elementor-panel-footer-global-styles" class="elementor-panel-footer-tool elementor-toggle-state">
			<div data-tooltip="<?php esc_attr_e( 'Global Styles', 'elementor' ); ?>" class="tooltip-target">
				<svg width="43" height="24" viewBox="0 0 43 24" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
					<rect x="19" width="24" height="24" fill="url(#pattern7)"/>
					<rect width="24" height="24" fill="url(#pattern8)"/>
					<defs>
					<pattern id="pattern7" patternContentUnits="objectBoundingBox" width="1" height="1">
					<use xlink:href="#image7" transform="scale(0.0416667)"/>
					</pattern>
					<pattern id="pattern8" patternContentUnits="objectBoundingBox" width="1" height="1">
					<use xlink:href="#image8" transform="scale(0.0416667)"/>
					</pattern>
					<image id="image7" width="24" height="24" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAAXUlEQVRIiWNgGAWjYBQMfcCITzI9Pb38////HQTMaJg1a1YjLklmfDrPnj171MTE5AcDA4MLOYYTtICAJQQNJ8oCHJYQZTjRFsAsMTY2ZmRgYDhIrOGjYBSMAjoBAHZ6Jl09U/Y9AAAAAElFTkSuQmCC"/>
					<image id="image8" width="24" height="24" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAADfklEQVRIidWVXWgcVRTHf2d2x4RolUXsQyQKwZduVUxmTIkEUrEfklJBIViRYtjszix59k3FLT6IUPwKSWZn1mVNAn5sNVXEVoyKH1UUVnwQREtf1FWsummhFA2be3xwFrfpJkUUxP/LzLnnnt//nsu9M/BfaWJiovvf4Mj6gXw+f6Mx5gVgO3AcuC8Mw7ObQXzff1hVHxQRv1gsvrShQTab3WZZ1vvANUATSAIfAXvDMDzfCe55XgF4NA6bqnowiqIXW3nrAjeRZ2L4MRFJA98CI6pa9TzP3gTeVNUjQFJEFnzfv3cjg9749bVisXgykUjsAU6LyBgwXygUrA5wVPX5KIrGgSqQVNViRwNgOn7O5nK5qbm5ua8ty7oTOAscqNfrM3+tRba1LSyTy+VKwN1xfLiVS7TTa7VazXGcc8AeEdnnuu5vxWLxyMDAwAkROSAiw47jdNdqteX+/v7Xe3p6hoAbYsPBeMGFMAwf62gQm3ziuu6PwD5gt+M4dhRFFcdxvgDGgVHHcc4vLCx8mE6nl2zbvh3oi8sLYRgeauddZNDqxHXdk8BdwM7BwcGroyiadhznVLwNu13X/b5cLn86NDT0qqqOAXPr4dDhHrTL9/39qvoy0C0ilUajkU2lUgGQBdZUdTyKoqWpqakrZmdnz3VibGoAkMvldonIUeBy/rwTO4DWkf3dGDNWKpXe3ah+/Sm6QJlMZksURcuWZe0FzgAjgK2qTwBPAV2WZR3N5/NDf9vA87xCMpn8fHJy8vogCE4AdwA/x+kdXV1dBVWdB7YYY970fT/didNxi9Zd/+9UdVcURd/En5JloFdVP0skEvuNMUvAbUAdeGhlZWWxWq2ubdqBbdvTwFwc9onIB9ls9uZSqfSVMWYEOCUiQ8aYj4Fb43nXApVUKvXcJTsAyOfzW40xP7UNrViWdVMQBPVMJtObTCbfBtIAIvKGqr4DPA5c1mw2+8rl8g8XdZDL5e73fX8YIAiC06urq6m2Tp4NgqAOEBePAl8CGGOOhWH4tKq+BVi2bY923CIRGVbV4y2TSqVyxrbtR4BDYRgW2ueGYfiLiDwZ1x32PO8V4Ko4PdLRQFW3A1e2m8zMzPy6Ht5So9GYBxaBbuAeEdkZc27ZqIOtwHsismiM6e8EbVe1Wl0Lw/CgMeY6EXkAKIlIDbhk7T9S+3/j/68/ACdhXkAPbN6bAAAAAElFTkSuQmCC"/>
					</defs>
				</svg>
			</div>
			<span class="elementor-screen-only"><?php echo esc_html__( 'Global Styles', 'elementor' ); ?></span>
			<div class="elementor-panel-footer-sub-menu">
				<div id="elementor-panel-footer-sub-menu-item-page-settings" class="elementor-panel-footer-sub-menu-item">
					<!-- <i class="elementor-icon eicon-save" aria-hidden="true"></i> -->
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
						<rect width="16" height="16" fill="url(#pattern15)"/>
						<defs>
						<pattern id="pattern15" patternContentUnits="objectBoundingBox" width="1" height="1">
						<use xlink:href="#image15" transform="scale(0.0416667)"/>
						</pattern>
						<image id="image15" width="24" height="24" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAABP0lEQVRIieXVvUoDQRQF4E/tEg34U9oLsdWglYWF2olB7dTWwryElYWVoJ2+ge+QN1Bs0gUUQcQySWksdoNxmVkjiYV44MLO7LnnzM6dO8t/wRZa6KbRwuYgieMDGuyj2DcupnMjwSKaPlffiybK3yWPBcYXmMMt1nAc4PXQxRXq2MEbTtL5II4CK/1pHMbEJ/E8AoMXlEIGtZykR1QxlcY2Gjn8WshgFe2I+EyAP52+y/LbWIltUwWdTEI1RsZuhttJNXLR31BdyZbEUMpwW1nCoI0WQ+z4Rg0qgbn1nPyNgF50i2JFbkgKmsUsngL8L0XuX+0yCgGhBdxLClpKYw93mA/wC7Gv+PVGI2nzYQ0O+gUnMgYPkouuiVO8Ykn8tLzjEufpcx1nci67EMqGuK4HxU3A4HpU4gzxy/z7+ABsuKy+qDOyAQAAAABJRU5ErkJggg=="/>
						</defs>
					</svg>
					<span class="elementor-title"><?php echo esc_html__( 'Page Settings', 'elementor' ); ?></span>
				</div>
				<div id="elementor-panel-footer-sub-menu-item-site-settings" class="elementor-panel-footer-sub-menu-item">
					<!-- <i class="elementor-icon eicon-folder" aria-hidden="true"></i> -->
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
						<rect width="16" height="16" fill="url(#pattern16)"/>
						<defs>
						<pattern id="pattern16" patternContentUnits="objectBoundingBox" width="1" height="1">
						<use xlink:href="#image16" transform="scale(0.0416667)"/>
						</pattern>
						<image id="image16" width="24" height="24" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAABgklEQVRIid2Uv04CQRDGfxr+lGqhvT4CirXE3gAx1GqDAXt9AmN8CDEq9vowgiitldocUYkJZ3Hf5hbY4w5ixZds9uabuW/vZmYH5h0ZoALcA22gp9UGmvJlZhUvA13Aj1mvQGka4UXg0hL41f4JbAF5Pds+H7jQu7Ew4t9AjSAdPnBgxRyKawN14Mc6ZCLKCvwCdoBN2e9AyopLifOBHFDQB/lAMUo8Q5BPH6iKO5N95YhvyHcquya7S0ThK8QXNOnaN6J2UabqhBg409QhzKnBh7hVR/waYX0McoTFH4Mn57LF9cVlHfFZ+foWtyLOM0Sivo3AwgTfwHXAm/YNi+tpX3KIGM6zuPURrSE0+b8uunH9wYPr1Bnx6CLThJ10LM5ctIYj/prhi1aX/SwtJ0qEc6hA8lGxq3cGwN7knwsGlk8wwOpAi/FhdySuBZwQDrvzOHEI6mIOGR3XeWCb8XE9kPhUbV8EXojvmA4J0hKFNMHguiNIh6f1BNzKF1nQ+cAfSk+r/RlDxYgAAAAASUVORK5CYII="/>
						</defs>
					</svg>
					<span class="elementor-title"><?php echo esc_html__( 'Site Settings', 'elementor' ); ?></span>
				</div>
			</div>
		</div>
		<div id="elementor-panel-footer-more" class="elementor-panel-footer-tool elementor-toggle-state">
			<div class="tooltip-target" data-tooltip="<?php esc_attr_e( 'More', 'elementor' ); ?>">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
					<rect width="24" height="24" fill="url(#pattern9)"/>
					<defs>
					<pattern id="pattern9" patternContentUnits="objectBoundingBox" width="1" height="1">
					<use xlink:href="#image9" transform="scale(0.0416667)"/>
					</pattern>
					<image id="image9" width="24" height="24" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAAU0lEQVRIie3NOxGAQBAE0R5sgCN8rCauTgiCwMcQkfBJDhKofWEnDSml79MxRMQIFMC2o9Y6t/RddzGdgB4YJJUH/XbwqtPAdgArsEiK1p5S+pMNtBgwApvq0L4AAAAASUVORK5CYII="/>
					</defs>
				</svg>
			</div>
			<span class="elementor-screen-only"><?php echo esc_html__( 'More', 'elementor' ); ?></span>
			<div class="elementor-panel-footer-sub-menu">
				<div id="elementor-panel-footer-sub-menu-item-preferences" class="elementor-panel-footer-sub-menu-item">
					<!-- <i class="elementor-icon eicon-save" aria-hidden="true"></i> -->
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
						<rect width="16" height="16" fill="url(#pattern13)"/>
						<defs>
						<pattern id="pattern13" patternContentUnits="objectBoundingBox" width="1" height="1">
						<use xlink:href="#image13" transform="scale(0.0416667)"/>
						</pattern>
						<image id="image13" width="24" height="24" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAAdUlEQVRIieWUQQqAMAwEp+L/P6W+q148yQqbVGnAufTSNmQzBP7CAXRgiz5s5r2eeAPA+vBJtKiiASzBT8N8HpHbwX6d4SGXxlI3lOcNay4jmlpFy2iqsCIa6aCuuunNqVDZpdeCwtU0o/A8TV+NSHVQV78pnBhuGEafnjPxAAAAAElFTkSuQmCC"/>
						</defs>
					</svg>
					<span class="elementor-title"><?php echo esc_html__( 'Preferences', 'elementor' ); ?></span>
				</div>
				<div id="elementor-panel-footer-sub-menu-item-keyboard-shortcuts" class="elementor-panel-footer-sub-menu-item">
					<!-- <i class="elementor-icon eicon-folder" aria-hidden="true"></i> -->
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
						<rect width="16" height="16" fill="url(#pattern14)"/>
						<defs>
						<pattern id="pattern14" patternContentUnits="objectBoundingBox" width="1" height="1">
						<use xlink:href="#image14" transform="scale(0.0416667)"/>
						</pattern>
						<image id="image14" width="24" height="24" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAAeElEQVRIie2UYQqAIAxGn9Hhku5/AfUe9aMUiRYGn0Hgg+HQsY9NHQwGKlYgAZvIIuBrgShMni3UAnlTRck3CZPeYgnUFb31mwTkdLuD+SEAwDUI1zHueti9RVYFzvAtzJjPnmk6V9UvhmM6FDzacRGARdCAwR/YAYJDZvmoGcvHAAAAAElFTkSuQmCC"/>
						</defs>
					</svg>
					<span class="elementor-title"><?php echo esc_html__( 'Keyboard Shortcuts', 'elementor' ); ?></span>
				</div>
			</div>
		</div>
	</div>
	<div id="e-responsive-bar__center">
		<div id="e-responsive-bar-switcher" class="e-responsive-bar--pipe">
			<?php foreach ( $active_devices as $device_key ) {
				if ( 'desktop' === $device_key ) {
					$tooltip_label = esc_html__( 'Desktop <br> Settings added for the base device will apply to all breakpoints unless edited', 'elementor' );
				} elseif ( 'widescreen' === $device_key ) {
					$tooltip_label = esc_html__( 'Widescreen <br> Settings added for the Widescreen device will apply to screen sizes %dpx and up', 'elementor' );

					$tooltip_label = sprintf( $tooltip_label, $active_breakpoints[ $device_key ]->get_value() );
				} else {
					$tooltip_label = sprintf( $breakpoint_label, $active_breakpoints[ $device_key ]->get_label(), $active_breakpoints[ $device_key ]->get_value() );
				}
				printf('<label
					id="e-responsive-bar-switcher__option-%1$s"
					class="e-responsive-bar-switcher__option elementor-panel-footer-tool tooltip-target"
					for="e-responsive-bar-switch-%1$s"
					data-tooltip="%2$s">

					<input type="radio" name="breakpoint" id="e-responsive-bar-switch-%1$s" value="%1$s">
					<i class="%3$s" aria-hidden="true"></i>
					<span class="screen-reader-text">%2$s</span>
				</label>', esc_attr( $device_key ), esc_attr( $tooltip_label ), esc_attr( $breakpoint_classes_map[ $device_key ] ) );
			} ?>
		</div>
		<div id="e-responsive-bar-scale">
			<div id="e-responsive-bar-scale__minus"></div>
			<div id="e-responsive-bar-scale__value-wrapper"><span id="e-responsive-bar-scale__value">100</span>%</div>
			<div id="e-responsive-bar-scale__plus"><i class="eicon-plus" aria-hidden="true"></i></div>
			<div id="e-responsive-bar-scale__reset"><i class="eicon-undo" aria-hidden="true"></i></div>
		</div>
		<div id="e-responsive-bar__size-inputs-wrapper" class="e-flex e-align-items-center" style="display:none;">
			<label for="e-responsive-bar__input-width">W</label>
			<input type="number" id="e-responsive-bar__input-width" class="e-responsive-bar__input-size" autocomplete="off">
			<label for="e-responsive-bar__input-height">H</label>
			<input type="number" id="e-responsive-bar__input-height" class="e-responsive-bar__input-size" autocomplete="off">
		</div>
	</div>
	<div id="e-responsive-bar__end">
		<div id="elementor-panel-footer-finder" class="elementor-panel-footer-tool tooltip-target" data-tooltip="<?php esc_attr_e( 'Finder', 'elementor' ); ?>">
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
				<rect width="24" height="24" fill="url(#pattern3)"/>
				<defs>
				<pattern id="pattern3" patternContentUnits="objectBoundingBox" width="1" height="1">
				<use xlink:href="#image3" transform="scale(0.0416667)"/>
				</pattern>
				<image id="image3" width="24" height="24" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAB9ElEQVRIidWUsW7TUBSGvxMnA0pLt74A5QXiiImhSIytUBErA4NlL5HoQmFBFBYiJIpUMfiGkp1KCAgSCwMMncCeGBAqTwBDYXGVG/sw1K4AJdihlRD/dH10/v+75+pew/8uGVcMgmA+TdOOiCwBp/PyJ+CltXaz3+9/+WuA7/uXVPUxMDvB811EroRh+LQKoDYm/Eke/kxVF5MkmUmSZKZWq51T1efASVXd9jxvZaoJgiCYz7JsNw+/Zoy5N87g+/6aqt4FvgELxpivlSZI07RT7HxSOEAYhl1gAMyJSKdsgkOAiCwDqOqDMhOwkfcuVwYApwAajUZUZhqNRu/z5cI0AC1rLtRsNsde7zLAZ4Asy9plpiRJip7daQADgDRNr5aZHMdZzZcvKgOstZscPKILvu+vTTJ4nndDVZeAPWvtwzLAL2fp+/5FVd3OwQNgo16vvwMYDodnHMdZzcMBbhpj7kwFyHe4IiJ9YG6CZw+4D9zOv9eNMbcmAZzfC3Ecf3Rd95GI7HPw8GYBC3wQkZ619vLW1tYr13WL0EXXdSWKojeVJqiqn34ZAKhqt9frXS+doKqiKNppt9v7wHkAETnbarVOxHH8+lgAVSFHAlSB1P7orqgwDLsicnj+IpIU6yNPUCiKoh3XdQV4a4xZP67cf68fSibP4MEj5O8AAAAASUVORK5CYII="/>
				</defs>
			</svg>
			<span class="elementor-screen-only"><?php echo esc_html__( 'Finder', 'elementor' ); ?></span>
		</div>
		<a href="/wp-admin/admin.php?page=go_knowledge_base_site" target="_blank" id="elementor-panel-footer-help" class="elementor-panel-footer-tool tooltip-target" data-tooltip="<?php esc_attr_e( 'Help', 'elementor' ); ?>">
			<!-- <a href="/wp-admin/admin.php?page=go_knowledge_base_site" target="_blank"> -->
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
				<rect width="24" height="24" fill="url(#pattern2)"/>
				<defs>
				<pattern id="pattern2" patternContentUnits="objectBoundingBox" width="1" height="1">
				<use xlink:href="#image2" transform="scale(0.0416667)"/>
				</pattern>
				<image id="image2" width="24" height="24" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAADCElEQVRIid2Vz2scZRjHP0+zu81JMr1ltsFSerIUxfoHVNAWCqVrYTzqoczsJhAEaUkJHubWllJykCbMzCbgUUZp4kGFVsSboAWtFpHaQ01mPWZACGwzmaeHvpNOJrtJe9Tn8r7z/Pq+z3fe53nhvy6yl9FxnMbY2FgLaInIm8BhY1oD7qnqSpqmy3EcP3lpgHa7fUFVbwBH9znkI1W9HEXR7RcC8H3/QK/XuwZcNqr7wKKI3N3Y2HgMMDo6egR4R0QuAicAVPV6s9mc9X0/L+erVQFKyfvAR7ZtR9Ug4AHwwPf9T3u9XhuYE5GZJEkArgytwNDyJdBX1TNRFP0AMDU1NZFl2Rxw2rh+NzIycmVhYeFPgE6ncyrP82+Bg8B7YRgu7wJwHKdhWdYfPOO8E4ZhUEr+C3CoUsV6rVZ7fX5+fhXAdd0pEbkF/AW8FobhJsCBwtvclqPAfdu2o0JvTn5IVb/O83wiz/MJ4BvAyrLsZuGXpmkA/A4cE5HzhX4bAGiZdbHC+WkAVW13u921bre7VqvV2sZ2pnCK43gLWKzkev6TReSkWe+WeQjD8JUKNWRZVlC74/6r6h0RQVXfGlTBOMDm5uZqNWFZpqenD6rqgvn8rGzb2tr622ztQQD7iu/7tX6/H4vIWeD79fX12f1iygD/ANTr9YlhzkmSXAfOiciPWZadr46IRqPxqtn2BgH8DJDn+bvDAETkQ7P9YGlp6d+qvRT703ZMsXFd930R+Rz4zbbtNwZ0757iOM6IZVm/AsdFxAmC4IsdFaRpugw8Ak6Y9t8lnuep53k6yGZZ1iRwHHioqiuFfhsgjuMnqloMuLlOp3PqRU/ved7bwE1AVfVS0cUwYJq6rntNRGZ4No8+TtM0ME20SwwtkyZ5Q0SuBkGw42btmqbNZnM2SRJEZEZEblmWNel53qKq3qnX648B8jw/Yn7oRUOLisjV8fHxT6r5hj44nue1gBvAsWE+Rh6q6qUoir4aZNzzyfQ8r24GV0tVT/L8yVwF7onIiqqulDn//8lT1LxEYIc8SAIAAAAASUVORK5CYII="/>
				</defs>
			</svg>
			<span class="elementor-screen-only"><?php echo esc_html__( 'Help', 'elementor' ); ?></span>
			<!-- </a> -->
		</a>
		<div id="elementor-panel-footer-saver-preview" class="elementor-panel-footer-tool tooltip-target" data-tooltip="<?php esc_attr_e( 'Preview Changes', 'elementor' ); ?>">
			<span id="elementor-panel-footer-saver-preview-label">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
					<rect width="24" height="24" fill="url(#pattern0)"/>
					<defs>
						<pattern id="pattern0" patternContentUnits="objectBoundingBox" width="1" height="1">
							<use xlink:href="#image0" transform="scale(0.0416667)"/>
						</pattern>
						<image id="image0" width="24" height="24" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAACH0lEQVRIie1UP2gTYRx9v+8uLsmQiIueEHDr5FIC0iW6iW6SwcF2uJCEjAX/EDUeLQaCUKeGy5EszeDkUBTcpF2rDk5ugtB0EpMhcJDc5TmYhuT4aCooXfq2ez/e+73f7/vuA85x1pCTirZtXzQM4z6A2wCuA7g0Kf0E8BXAhzAM37Tb7V9/1cBxHLPb7T4UkQqAxIKQA5I1y7JeOY4TLGyQz+evishbEcksMJ4DyQOS91qt1uEsr2Y/bNtOK6X2o+Ykd0lmfd9P+L6fUErdBPBuLqlIRim1b9t2WjtBuVxOBEFwAGApInzSbDbrutSFQqEC4GWE/maaZqbRaAwAwDxmR6PRtojMmZPc9TyvnsvlLqRSqU0AD/7Q7PT7/arnebVisXiD5N0Z2dJoNNoGsDZdUalUyorIqibkawBIJpMbAB4BuAzgiog8nnAguRUVichqqVTKThuMx+NN3QpisdiXY4HGZA0AgiD4rNOS3Jg2OAWo4UIAiMfjJ/5LCgCUUs91xfF4vDxJ09GUOwDg+/6yTisi1WkD13X3SO5oGqwDQL/fr5KsAzgCcESy3uv1XkzCrUd1JHdc190DTnFNATz1PK+mS1ksFp+RjJ7f3DWd259t22nDMD4CuBYZ9z3JLdM0PwHAcDjMTJLfiZh/D8PwVrvd/jHVRlP916cCAFqt1qFlWSskKwAGp/AekKxYlrUSNddOMIt/8Vyf4+zxG6288KOK0kjkAAAAAElFTkSuQmCC"/>
					</defs>
				</svg>
				<span class="elementor-screen-only"><?php echo esc_html__( 'Preview Changes', 'elementor' ); ?></span>
			</span>
		</div>
		<div id="elementor-panel-footer-saver-publish" class="elementor-panel-footer-tool">
			<button id="elementor-panel-saver-button-publish" class="elementor-button elementor-button-success elementor-disabled">
				<span class="elementor-state-icon">
					<i class="eicon-loading eicon-animation-spin" aria-hidden="true"></i>
				</span>
				<span id="elementor-panel-saver-button-publish-label">
					<?php echo esc_html__( 'Publish', 'elementor' ); ?>
				</span>
			</button>
		</div>
		<div id="elementor-panel-footer-saver-options" class="elementor-panel-footer-tool elementor-toggle-state">
			<button id="elementor-panel-saver-button-save-options" class="elementor-button elementor-button-success tooltip-target elementor-disabled" data-tooltip="<?php esc_attr_e( 'Save Options', 'elementor' ); ?>" data-tooltip-offset="7">
				<svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
					<rect x="0.727295" width="24" height="24" fill="url(#pattern1)"/>
					<defs>
					<pattern id="pattern1" patternContentUnits="objectBoundingBox" width="1" height="1">
					<use xlink:href="#image1" transform="scale(0.0416667)"/>
					</pattern>
					<image id="image1" width="24" height="24" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAAw0lEQVRIie2RMQ7CMAxF/4cLcJaqAxsjJ4ktBiicpBULkJswdWZoz8LIZgaKlKFpCxJiyVsy2HnfcYBEIvFX6JxbjTV1PYzVZzG5iFQka+dcEbssIkqyFpFTLCQWAJL2Olj2hYiIAoiK38xjhaZprnmeLwAsSa6zLLu3bXvrkV+89xsA1jvoUDoAqmppZgUAM7MDycdU+ZQAoPsPALtARABH7/1+SA4MrCgkXFcw+XZM/ilU1UpEzpj28u9CfilPJPp5ApBlQQmboDTYAAAAAElFTkSuQmCC"/>
					</defs>
				</svg>
				<span class="elementor-screen-only"><?php echo esc_html__( 'Save Options', 'elementor' ); ?></span>
			</button>
			<!-- <p class="elementor-last-edited-wrapper">
				<span class="elementor-state-icon">
					<i class="eicon-loading eicon-animation-spin" aria-hidden="true"></i>
				</span>
				<span class="elementor-last-edited">
				</span>
			</p> -->
			<div class="elementor-panel-footer-sub-menu">
				<div id="elementor-panel-footer-sub-menu-item-save-draft" class="elementor-panel-footer-sub-menu-item elementor-disabled">
					<i class="elementor-icon eicon-save" aria-hidden="true"></i>
					<span class="elementor-title"><?php echo esc_html__( 'Save Draft', 'elementor' ); ?></span>
				</div>
				<div id="elementor-panel-footer-sub-menu-item-save-template" class="elementor-panel-footer-sub-menu-item">
					<i class="elementor-icon eicon-folder" aria-hidden="true"></i>
					<span class="elementor-title"><?php echo esc_html__( 'Save as Template', 'elementor' ); ?></span>
				</div>
			</div>
		</div>
	</div>
</script>
