import {Category} from "./Category";

export const Categories = (props) => {
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
