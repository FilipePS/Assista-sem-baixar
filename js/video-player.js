var video = document.querySelector("video")
video.style.minWidth = "600px"
video.style.maxWidth = "800px"

var subtitlesCount = 0

var html = `
<input type="file" value="Enviar legenda" accept=".vtt, .srt" onchange="openFile(event)" id="file">
<select onchange="selectEncoding(event)" id="encoding">
  <option value="utf-8" selected>utf-8</option>
  <option value="ISO-8859-1">ISO-8859-1</option>
</select>
`

var div = document.createElement('div')
div.innerHTML = html

document.body.appendChild(div)

var eFile = document.getElementById('file')
var eEncoding = document.getElementById('encoding')

var eTrack = null

function selectEncoding(event) {
    if (eTrack) {
        window.URL.revokeObjectURL(eEncoding.getAttribute('src'))
        eTrack.remove()
        eTrack = null
        subtitlesCount--
        openFile()
    }
}

function openFile(event) {
    var reader = new FileReader();
    reader.onload = function () {
        var text = reader.result;
        
        if (eFile.files[0].name.toLowerCase().endsWith(".srt")) {
            text = srt2webvtt(text)
        }
        var blob = new Blob([text], {
            type: "text/plain"
        })

        eTrack = document.createElement('track')
        eTrack.setAttribute('label', "Sub " + (++subtitlesCount))
        eTrack.setAttribute('kind', 'subtitles')
        eTrack.setAttribute('default', '')
        eTrack.setAttribute('src', window.URL.createObjectURL(blob))

        video.appendChild(eTrack)
    };
    reader.readAsText(eFile.files[0], eEncoding.value);
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
