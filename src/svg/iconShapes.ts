// Icon: Shapes Fill 16
// Source: https://iconbuddy.com/garden/shapes-fill-16
// License: Check source for details. IconBuddy, Garden SVG Icons

import { IconProps } from "./props";

function create(props?: IconProps): string {
	const fill = props?.fill ?? "#FFFFFF";
	const size = props?.size ?? 200;
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 16 16"><path fill="${fill}" d="M6 9a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1zm6.25-.5a3.75 3.75 0 1 1 0 7.5a3.75 3.75 0 0 1 0-7.5M8.857.486l3 5A1 1 0 0 1 11 7H5a1 1 0 0 1-.857-1.514l3-5a1 1 0 0 1 1.714 0"/></svg>`;
}

export const iconShapes = create();
export const createIconShapes = create;
