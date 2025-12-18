// Icon: Curve Adjustment
// Source: https://iconbuddy.com/icon-park-solid/curve-adjustment
// License: Check source for details. IconBuddy, IconPark Solid Icons

import { IconProps } from "./props";

function create(props?: IconProps): string {
	const fill = props?.fill ?? "#FFFFFF";
	const size = props?.size ?? 200;
	return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 48 48">
  <mask id="ipSCurveAdjustment0">
    <g fill="${fill}" stroke-linejoin="round" stroke-width="4">
      <rect x="4" y="4" width="40" height="40" rx="6" ry="6" fill="${fill}" stroke="#000000"/>
      <path stroke="#000000" stroke-linecap="round" d="M38 10c-6 0-11 4-14 14s-8 14-14 14"/>
    </g>
  </mask>
  <rect x="0" y="0" width="48" height="48" rx="6" ry="6" fill="${fill}" mask="url(#ipSCurveAdjustment0)"/>
</svg>`;
}

export const iconAdjust = create();
export const createIconAdjust = create;
