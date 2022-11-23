import {Element as ElementType} from "./../types/index";
import React from "react";

export const Element:React.VFC<ElementType> = (props) => {
	return (
		<div className="elementor-element-wrapper">
			<div className="elementor-element" draggable="true" data-name={props.name}>
				<div className="icon">
					<i className={props.icon} aria-hidden="true"></i>
				</div>
				<div className="elementor-element-title-wrapper">
					<div className="title">{props.title}</div>
				</div>
			</div>
		</div>
	);
};
