
chrome.runtime.sendMessage({action: "getVideoUrls"}, video_urls => {
    if (video_urls.indexOf(window.location.href) !== -1) {
        injectVideoPlayer()
    }
})

function injectVideoPlayer() {
    console.log("Injetando o player de video")
}