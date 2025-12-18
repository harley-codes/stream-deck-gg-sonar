import { ELGATO_ALT_WHITE } from "../const/elgatoColors";
import { SONAR_COLOR_CHATMIX } from "../const/sonarColors";

import { createIconAdjust } from "../svg/iconAdjust";

const ICON_WHITE = createIconAdjust({ fill: ELGATO_ALT_WHITE });
const ICON_COLORED = createIconAdjust({ fill: SONAR_COLOR_CHATMIX });

export function getChatmixIcon(colored: boolean = true): string {
	const svg = colored ? ICON_COLORED : ICON_WHITE;
	return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}
