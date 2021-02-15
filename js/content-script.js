chrome.runtime.sendMessage({
    action: "getVideoUrls"
}, video_urls => {
    if (video_urls.indexOf(window.location.href) !== -1) {
        inject()
    }
})

function addTrack(video, file) {
    var reader = new FileReader();
    reader.onload = function () {
        var array_buffer = new Uint8Array(reader.result);
        if (array_buffer[0] === 239 && array_buffer[1] === 187 && array_buffer[2] === 191) {
            var textDecoder = new TextDecoder('utf-8')
        } else {
           var textDecoder = new TextDecoder('ISO-8859-1')
        }
        var text = textDecoder.decode(array_buffer)

        if (file.files[0].name.toLowerCase().endsWith(".srt")) {
            text = srt2webvtt(text)
        }
        var blob = new Blob([text], {
            type: "text/plain"
        })

        var subtitlesCount = video.querySelectorAll("track").length + 1

        var track = document.createElement('track')
        track.setAttribute('label', "Sub " + subtitlesCount)
        track.setAttribute('kind', 'subtitles')
        track.setAttribute('default', '')
        track.setAttribute('src', window.URL.createObjectURL(blob))

        video.appendChild(track)
    }
    reader.readAsArrayBuffer(file.files[0])
}

function selectLegendFile(video) {
    var file = document.createElement("input")
    file.setAttribute("hidden", "")
    file.setAttribute("type", "file")
    file.setAttribute("accept", ".vtt, .srt")
    document.body.appendChild(file)

    file.onchange = function (event) {
        event.stopImmediatePropagation()
        addTrack(video, file)
        file.remove()
    }

    file.click()
}

function inject() {
    var video = document.querySelector("video")

    if (!video) {
        throw new Error("Não foi  encontrado o elemento de vídeo")
    }

    video.style.minWidth = "600px"
    video.style.maxWidth = "800px"

    var file = document.createElement("input")
    file.setAttribute("type", "file")
    file.setAttribute("accept", ".vtt, .srt")
    document.body.appendChild(file)

    file.onchange = function (event) {
        event.stopImmediatePropagation()
        addTrack(video, file)
    }
}

function srt2webvtt(data) {
    // remove dos newlines
    var srt = data.replace(/\r+/g, '');
    // trim white space start and end
    srt = srt.replace(/^\s+|\s+$/g, '');
    // get cues
    var cuelist = srt.split('\n\n');
    var result = "";
    if (cuelist.length > 0) {
        result += "WEBVTT\n\n";
        for (var i = 0; i < cuelist.length; i = i + 1) {
            result += convertSrtCue(cuelist[i]);
        }
    }
    return result;
}

function convertSrtCue(caption) {
    // remove all html tags for security reasons
    //srt = srt.replace(/<[a-zA-Z\/][^>]*>/g, '');
    var cue = "";
    var s = caption.split(/\n/);
    // concatenate muilt-line string separated in array into one
    while (s.length > 3) {
        for (var i = 3; i < s.length; i++) {
            s[2] += "\n" + s[i]
        }
        s.splice(3, s.length - 3);
    }
    var line = 0;
    // detect identifier
    if (!s[0].match(/\d+:\d+:\d+/) && s[1].match(/\d+:\d+:\d+/)) {
        cue += s[0].match(/\w+/) + "\n";
        line += 1;
    }
    // get time strings
    if (s[line].match(/\d+:\d+:\d+/)) {
        // convert time string
        var m = s[1].match(/(\d+):(\d+):(\d+)(?:,(\d+))?\s*--?>\s*(\d+):(\d+):(\d+)(?:,(\d+))?/);
        if (m) {
            cue += m[1] + ":" + m[2] + ":" + m[3] + "." + m[4] + " --> " +
                m[5] + ":" + m[6] + ":" + m[7] + "." + m[8] + "\n";
            line += 1;
        } else {
            // Unrecognized timestring
            return "";
        }
    } else {
        // file format error or comment lines
        return "";
    }
    // get cue text
    if (s[line]) {
        cue += s[line] + "\n\n";
    }
    return cue;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action == "add-subtitles") {
        var video = chrome.menus.getTargetElement(message.targetElementId)
        selectLegendFile(video)
    }
    return false
})