import { ELGATO_ALT_WHITE, ELGATO_GREY } from "../const/elgatoColors";
import { createIconHeadset } from "../svg/iconHeadset";
import { createIconSonar } from "../svg/iconSonar";
import { StreamType } from "../types/streamTypes";

const HEADSET_ACTIVE = createIconHeadset({ fill: ELGATO_ALT_WHITE });
const HEADSET_INACTIVE = createIconHeadset({ fill: ELGATO_GREY });
const SONAR_ACTIVE = createIconSonar({ fill: ELGATO_ALT_WHITE });
const SONAR_INACTIVE = createIconSonar({ fill: ELGATO_GREY });

function get(streamType: StreamType, active: boolean): string {
	switch (streamType) {
		case "streaming":
			return active ? SONAR_ACTIVE : SONAR_INACTIVE;
		case "monitoring":
			return active ? HEADSET_ACTIVE : HEADSET_INACTIVE;
	}
}

export function getStreamerIcon(
	streamType: StreamType,
	active: boolean
): string {
	const svg = get(streamType, active);
	return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}
