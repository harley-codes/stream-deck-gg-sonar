// Icon: Voice Chat
// Source: https://iconbuddy.com/material-symbols/voice-chat
// License: Check source for details. IconBuddy, Material Symbols Icons

import { IconProps } from "./props";

function create(props?: IconProps): string {
	const fill = props?.fill ?? "#FFFFFF";
	const size = props?.size ?? 200;
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24"><path fill="${fill}" d="M6 11h1.5V9H6v2Zm2.5 2H10V7H8.5v6Zm2.75 2h1.5V5h-1.5v10ZM14 13h1.5V7H14v6Zm2.5-2H18V9h-1.5v2ZM2 22V4q0-.825.588-1.413T4 2h16q.825 0 1.413.588T22 4v12q0 .825-.588 1.413T20 18H6l-4 4Z"/></svg>`;
}

export const iconVoiceChat = create();
export const createIconVoiceChat = create;
