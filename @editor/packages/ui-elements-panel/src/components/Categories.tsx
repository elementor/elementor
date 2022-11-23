import {Category} from "./Category";
import React from "react";
import {Category as CategoryType, Element } from "./../types/index";

type Props = {
	categories: CategoryType[];
	elements: Element[];
}

export const Categories: React.VFC<Props> = (props) => {
	return (
		<>
			{props.categories.map((category, index) => {
				return <Category
					key={index}
					{...category}
					elements={props.elements.filter((element) => element.categories.includes(category.id))}
				/>;
			})}
		</>
	);
};
