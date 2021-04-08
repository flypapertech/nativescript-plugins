import { DemoSharedBase, ObservableProperty } from '../utils';
import { CameraPlus, ErrorEvent, ImagesSelectedEvent, PhotoCapturedEvent, ToggleCameraEvent, VideoRecordingFinishedEvent, VideoRecordingReadyEvent, VideoRecordingStartedEvent } from '@nstudio/nativescript-camera-plus';
import { Frame, Image, ImageSource, Page, Screen } from '@nativescript/core';

export class DemoSharedNativescriptCameraPlus extends DemoSharedBase {
	private _counter: number = 0;
	@ObservableProperty()
	public cam: CameraPlus;
	@ObservableProperty()
	public cameraHeight: number;

	constructor(private page: Page) {
		super();

		this.cam = (this.page.getViewById('camPlus') as unknown) as CameraPlus;

		// hide a default icon button here
		// this.cam.showGalleryIcon = false

		this.cameraHeight = Screen.mainScreen.heightDIPs * 0.6;

		if (this._counter > 0) {
			return;
		}

		this.cam.on(CameraPlus.errorEvent, (event: ErrorEvent) => {
			this.logCamEvent('CameraPlus.errorEvent', event);
		});

		this.cam.on(CameraPlus.toggleCameraEvent, (event: ToggleCameraEvent) => {
			this.logCamEvent('CameraPlus.toggleCameraEvent', event);
		});

		this.cam.on(CameraPlus.photoCapturedEvent, async (event: PhotoCapturedEvent) => {
			this.logCamEvent('CameraPlus.photoCapturedEvent', event);

			try {
				const imgSource = await ImageSource.fromAsset(event.data);
				const testImg: Image = Frame.topmost().getViewById('testImagePickResult');
				testImg.src = imgSource;
			} catch (error) {
				console.error(error);
			}
		});

		this.cam.on(CameraPlus.imagesSelectedEvent, (event: ImagesSelectedEvent) => {
			this.logCamEvent('CameraPlus.imagesSelectedEvent', event);
		});

		this.cam.on(CameraPlus.videoRecordingReadyEvent, (event: VideoRecordingReadyEvent) => {
			this.logCamEvent('CameraPlus.videoRecordingReadyEvent', event);
		});

		this.cam.on(CameraPlus.videoRecordingStartedEvent, (event: VideoRecordingStartedEvent) => {
			this.logCamEvent('CameraPlus.videoRecordingStartedEvent', event);
		});

		this.cam.on(CameraPlus.videoRecordingFinishedEvent, (event: VideoRecordingFinishedEvent) => {
			this.logCamEvent('CameraPlus.videoRecordingFinishedEvent', event);
		});

		this._counter = 1;
	}

	public recordDemoVideo() {
		try {
			console.info(`*** start recording ***`);
			this.cam.record({
				saveToGallery: true,
			});
		} catch (err) {
			console.error(err);
		}
	}

	public stopRecordingDemoVideo() {
		try {
			console.info(`*** stop recording ***`);
			this.cam.stop();
			console.info(`*** after this.cam.stop() ***`);
		} catch (err) {
			console.error(err);
		}
	}

	public toggleFlashOnCam() {
		this.cam.toggleFlash();
	}

	public toggleShowingFlashIcon() {
		console.info(`showFlashIcon = ${this.cam.showFlashIcon}`);
		this.cam.showFlashIcon = !this.cam.showFlashIcon;
	}

	public toggleTheCamera() {
		this.cam.toggleCamera();
	}

	public async openCamPlusLibrary() {
		try {
			const images = await this.cam.chooseFromLibrary();

			console.info('Images selected from library total:', images.length);
			for (const source of images) {
				console.info(`source = ${source}`);
			}

			const firstImg = images[0];
			const imgSource = await ImageSource.fromAsset(firstImg);
			const testImg: Image = Frame.topmost().getViewById('testImagePickResult');
			testImg.src = imgSource;
		} catch (error) {
			console.error('openCamPlusLibrary Error -> ' + error.message || error);
		}
	}

	public takePicFromCam() {
		this.cam.requestCameraPermissions().then(() => {
			if (!this.cam) {
				this.cam = new CameraPlus();
			}
			this.cam.takePicture({ saveToGallery: true });
		});
	}

	private logCamEvent(listenerName: string, event: any) {
		console.log(`Event data for listener: ${listenerName}`);
		console.log(`Name: ${event.eventName}`);
		console.log(`Data: ${event.data}`);
		console.log(`Object: ${event.object}`);
		console.log(`Message: ${event.message}`);
	}

	camLoaded(args: any) {
		const cam = args.object as CameraPlus;
		console.info('Cam loaded event');

		(async () => {
			if (!cam.hasCameraPermission()) {
				await cam.requestCameraPermissions();
			}
			cam.autoFocus = true;

			this.logFlashMode(cam);
			this.logAvailablePictureSizes(cam);
			this.logSupportRatios(cam);
		})();
	}

	logFlashMode(cam: CameraPlus): void {
		try {
			const flashMode = cam.getFlashMode();
			console.info(`Flash Mode: ${flashMode}`);
		} catch (error) {
			console.error(`Flash Mode: Failed to load: ${error.message}`);
			console.error(error.stack);
		}
	}

	logAvailablePictureSizes(cam: CameraPlus): void {
		const ratio = '16:9';
		const availableSizes = cam.getAvailablePictureSizes('16:9');
		console.info(`Picture Sizes Available for ${ratio}:`);
		for (const size of availableSizes) {
			console.info(size);
		}
		console.info(`Total sizes available: ${availableSizes.length}`);
	}

	logSupportRatios(cam: CameraPlus): void {
		const supportedRatios = cam.getSupportedRatios();
		if (supportedRatios.length === 0) {
			console.warn('Ratios supported: None found.');
		} else {
			console.info('Ratios supported:' + supportedRatios.join(', '));
		}
	}
}
