import { Channel, Sonar } from "steelseries-sonar-js";
import { SonarChannel } from "../types/sonarChannel";

type SonarVolumeData = {
	masters: ChannelSettings | undefined;
	devices: {
		game: ChannelSettings | undefined;
		chatRender: ChannelSettings | undefined;
		chatCapture: ChannelSettings | undefined;
		media: ChannelSettings | undefined;
		aux: ChannelSettings | undefined;
	};
};

type ChannelSettings = {
	classic: ClassicSettings;
};

type ClassicSettings = {
	volume: number;
	muted: boolean;
};

type ChatmixData = {
	balance: number;
	state: "enabled" | "finiteWheel" | string;
};

function fromClientChannelName(channel: SonarChannel): Channel {
	switch (channel) {
		case "master":
			return "master";
		case "game":
			return "game";
		case "chat":
			return "chatRender";
		case "media":
			return "media";
		case "aux":
			return "aux";
		case "mic":
			return "chatCapture";
	}
}

export async function getChannelData(
	channel: SonarChannel
): Promise<ClassicSettings | null> {
	try {
		const sonar = await Sonar.init();
		const volumeData = (await sonar.getVolumeData()) as SonarVolumeData;
		const internalChannel = fromClientChannelName(channel);

		const data =
			internalChannel === "master"
				? volumeData.masters?.classic
				: volumeData.devices[internalChannel]?.classic;

		return data ?? null;
	} catch {
		return null;
	}
}

export async function offsetChannelVolume(
	channel: SonarChannel,
	offsetTicks: number
): Promise<ClassicSettings | null> {
	try {
		const sonar = await Sonar.init();
		const currentVolumeData =
			(await sonar.getVolumeData()) as SonarVolumeData;
		const internalChannel = fromClientChannelName(channel);

		const currentData =
			internalChannel === "master"
				? currentVolumeData.masters?.classic
				: currentVolumeData.devices[internalChannel]?.classic;

		if (!currentData) return null;

		let offsetVolume = offsetTicks / 100;
		let newVolume = currentData.volume + offsetVolume;
		if (newVolume > 1) newVolume = 1;
		if (newVolume < 0) newVolume = 0;

		await sonar.setVolume(internalChannel, newVolume);

		const newVolumeData = (await sonar.getVolumeData()) as SonarVolumeData;

		const newData =
			internalChannel === "master"
				? newVolumeData.masters?.classic
				: newVolumeData.devices[internalChannel]?.classic;

		return newData ?? null;
	} catch {
		return null;
	}
}

export async function toggleChannelMute(
	channel: SonarChannel
): Promise<ClassicSettings | null> {
	try {
		const sonar = await Sonar.init();
		const volumeData = (await sonar.getVolumeData()) as SonarVolumeData;
		const internalChannel = fromClientChannelName(channel);

		const data =
			internalChannel === "master"
				? volumeData.masters?.classic
				: volumeData.devices[internalChannel]?.classic;

		if (!data) return null;

		await sonar.muteChannel(internalChannel, !data.muted);

		const newVolumeData = (await sonar.getVolumeData()) as SonarVolumeData;

		const newData =
			internalChannel === "master"
				? newVolumeData.masters?.classic
				: newVolumeData.devices[internalChannel]?.classic;

		return newData ?? null;
	} catch {
		return null;
	}
}

export async function getChatmixData(): Promise<ChatmixData | null> {
	try {
		const sonar = await Sonar.init();
		const data = (await sonar.getChatMixData()) as ChatmixData;
		return data ?? null;
	} catch {
		return null;
	}
}

export async function offsetChatmixBalance(
	offsetTicks: number
): Promise<ChatmixData | null> {
	try {
		const sonar = await Sonar.init();
		const currentData = (await sonar.getChatMixData()) as ChatmixData;

		if (!currentData) return null;

		let offsetMix = offsetTicks / 100;
		let newMix = currentData.balance + offsetMix;
		if (newMix > 1) newMix = 1;
		if (newMix < -1) newMix = -1;

		await sonar.setChatMix(newMix);

		const newData = (await sonar.getChatMixData()) as ChatmixData;
		return newData ?? null;
	} catch {
		return null;
	}
}
