// Icon: Headset
// Source: https://iconbuddy.com/zmdi/headset
// License: Check source for details. IconBuddy, Material Design Iconic Font Icons

import { IconProps } from "./props";

function create(props?: IconProps): string {
	const fill = props?.fill ?? "#FFFFFF";
	const size = props?.size ?? 200;
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 384 432" fill="${fill}"><path fill="${fill}" d="M192 5q80 0 136 56.5T384 197v150q0 26-18.5 45T320 411h-64V240h85v-43q0-62-43.5-105.5T192 48T86.5 91.5T43 197v43h85v171H64q-27 0-45.5-19T0 347V197q0-79 56-135.5T192 5z"/></svg>`;
}

export const iconHeadset = create();
export const createIconHeadset = create;
