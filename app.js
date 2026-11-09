const video = document.getElementById("camera");
const canvas = document.getElementById("photo");
const context = canvas.getContext("2d");

const statusText = document.getElementById("status");
const mode = document.getElementById("mode");

const startButton = document.getElementById("startButton");
const shootButton = document.getElementById("shootButton");
const stopButton = document.getElementById("stopButton");
const saveLink = document.getElementById("saveLink");

const stbFlag = false; // スタブを使用する場合はtrue、実カメラを使用する場合はfalseに設定

let stream = null;
let cameraMode = "stopped";

async function startCamera() {
    startButton.disabled = true;
    shootButton.disabled = true;

    cameraMode = "stopped";
    updateMode();

    statusText.textContent = "カメラを起動しています...";

    try {
        if (stbFlag) {
            throw new Error("スタブを使用するため、実カメラは起動しません");
        }

        // カメラAPIが利用できるか確認
        if (!navigator.mediaDevices?.getUserMedia) {
            throw new Error("カメラAPIを利用できません");
        }

        // 実カメラを起動
        stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        });

        video.srcObject = stream;
        await video.play();

        // shootButton.disabled = false;
        cameraMode = "camera";
        // updateMode();
        statusText.textContent = "実カメラを使用しています";

    } catch (error) {
        console.log("実カメラを利用できません:", error);

        // 取得済みのカメラを解放
        if (stream !== null) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }

        // スタブへ切り替え
        try {
            await startCameraStub(video);

            // shootButton.disabled = false;
            cameraMode = "stub";
            // updateMode();
            statusText.textContent = "スタブを使用しています";
        } catch (stubError) {
            console.error("スタブの起動に失敗しました:", stubError);

            video.pause();
            video.srcObject = null;
            video.removeAttribute("src");
            video.load();

            cameraMode = "stopped";
            // shutButton.disabled = true;
            statusText.textContent = "映像を表示できません";
            // startButton.disabled = false;
        }
    }

    updateMode();
    updateButtons(cameraMode !== "stopped");
}

startButton.addEventListener("click", startCamera);

function takePhoto() {
    // 映像が準備できているか確認
    if (video.videoWidth === 0 || video.videoHeight === 0) {
        return;
    }

    // Canvasのサイズを映像に合わせる
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // 現在の映像をCanvasに描画
    context.drawImage(video, 0, 0);

    // Canvasの内容をPNG形式の画像データに変換
    const imageData = canvas.toDataURL("image/png");

    // ダウンロードリンクを設定
    saveLink.href = imageData;
    saveLink.hidden = false;

    statusText.textContent = "写真を撮影しました";
}

shootButton.addEventListener("click", takePhoto);

function stopCamera() {
    // 実カメラの停止
    if (stream !== null) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }

    // 映像の再生を停止
    video.pause();
    video.srcObject = null;
    video.removeAttribute("src");
    video.load();

    // // ボタンの状態を変更
    // startButton.disabled = false;
    // shootButton.disabled = true;
    // stopButton.disabled = true;

    cameraMode = "stopped";

    updateMode();
    updateButtons(false);

    statusText.textContent = "カメラを停止しました";
}

stopButton.addEventListener("click", stopCamera);

function updateMode() {
    if (cameraMode === "camera") {
        mode.textContent = "動作モード：実カメラ";
    } else if (cameraMode === "stub") {
        mode.textContent = "動作モード：スタブ";
    } else {
        mode.textContent = "動作モード：停止中";
    }
}

function updateButtons(running) {
    startButton.disabled = running;
    shootButton.disabled = !running;
    stopButton.disabled = !running;
}
