chrome.runtime.sendMessage({
    action: "getVideoUrls"
}, video_urls => {
    if (video_urls.indexOf(window.location.href) !== -1) {
        injectVideoPlayer()
    }
})

function readLocalFile(_path) {
    return new Promise((resolve, reject) => {
        fetch(_path, {
                mode: 'same-origin'
            }) // <-- important

            .then(function (_res) {
                return _res.blob();
            })

            .then(function (_blob) {
                var reader = new FileReader();

                reader.addEventListener("loadend", function () {
                    resolve(this.result);
                });

                reader.readAsText(_blob);
            })

            .catch(e => {
                reject(e)
            })
    })
}

function injectVideoPlayer() {
    console.log("Injetando o player de video")

    var video = document.querySelector("video")

    if (!video) {
        throw new Error("Não foi encontrado nenhum elemento video")
    }

    var video_player_script = document.createElement("script")

    readLocalFile(chrome.runtime.getURL("js/video-player.js"))
    .then(response => {
        video_player_script.textContent = response
        document.body.appendChild(video_player_script)
    })
}