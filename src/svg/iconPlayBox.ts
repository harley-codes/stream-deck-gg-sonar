// Icon: Play Box
// Source: https://iconbuddy.com/mdi/play-box
// License: Check source for details. IconBuddy, Material Design Icons

import { IconProps } from "./props";

function create(props?: IconProps): string {
	const fill = props?.fill ?? "#FFFFFF";
	const size = props?.size ?? 200;
	return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="${fill}" d="M19 3H5c-1.11 0-2 .89-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5a2 2 0 0 0-2-2m-9 13V8l5 4"/></svg>`;
}

export const iconPlayBox = create();
export const createIconPlayBox = create;
