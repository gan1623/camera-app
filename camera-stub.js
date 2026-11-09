async function startCameraStub(video) {
    video.pause();
    video.srcObject = null;

    video.src = "sample.mp4";
    video.loop = true;
    video.muted = true;
    video.playsInline = true;

    await video.play();
}