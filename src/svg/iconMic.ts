// Icon: Mic
// Source: https://iconbuddy.com/zondicons/mic
// License: Check source for details. IconBuddy, Zondicons Icons

import { IconProps } from "./props";

function create(props?: IconProps): string {
	const fill = props?.fill ?? "#FFFFFF";
	const size = props?.size ?? 200;
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 20 20"><path fill="${fill}" d="M9 18v-1.06A8 8 0 0 1 2 9h2a6 6 0 1 0 12 0h2a8 8 0 0 1-7 7.94V18h3v2H6v-2h3zM6 4a4 4 0 1 1 8 0v5a4 4 0 1 1-8 0V4z"/></svg>`;
}

export const iconMic = create();
export const createIconMic = create;
