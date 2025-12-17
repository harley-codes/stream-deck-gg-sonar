export type SonarVolumeData = {
	masters: Channel;
	devices: {
		game: Channel | undefined;
		chatRender: Channel | undefined;
		chatCapture: Channel | undefined;
		media: Channel | undefined;
		aux: Channel | undefined;
	};
};

type Channel = {
	classic: ClassicSettings;
};

type ClassicSettings = {
	volume: number;
	muted: boolean;
};
