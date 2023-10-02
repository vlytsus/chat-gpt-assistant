if (!('webkitSpeechRecognition' in window)) {
  upgrade();
} else {
  var recognition = new webkitSpeechRecognition();
  var recognizing = false;
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onstart = function() {
    recognizing = true;
    console.log("Active listening...");
    //start_img.src = '/intl/en/chrome/assets/common/images/content/mic-animate.gif';
  };

  recognition.onerror = function(event) {
    if (event.error == 'no-speech') {
      console.log('info_no_speech');
      ignore_onend = true;
    }
    if (event.error == 'audio-capture') {
      console.log('info_no_microphone');
      ignore_onend = true;
    }
    if (event.error == 'not-allowed') {
      if (event.timeStamp - start_timestamp < 100) {
        console.log('info_blocked');
      } else {
        console.log('info_denied');
      }
      ignore_onend = true;
    }
  };

  recognition.onend = function() {
    recognizing = false;
  };

  recognition.onresult = function(event) {
    var interim_transcript = '';
    if (typeof(event.results) == 'undefined') {
      recognition.onend = null;
      recognition.stop();
      upgrade();
      return;
    }
    for (var i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        final_transcript = capitalize(event.results[i][0].transcript +=". ");

        interim_span.innerHTML = final_transcript;
        sendToGpt(final_transcript);
        return;
          
      } else {
        interim_transcript += event.results[i][0].transcript;
      }
    }

    interim_span.innerHTML = linebreak(interim_transcript);
    if (final_transcript || interim_transcript) {
      //showButtons('inline-block');
    }

  };
}

function talk(text){
    text = removeEmojis(text);
    speech.text = text;
    console.log("Voice response: " + text);
    document.getElementById("robot_icon").className = "blink";
    document.getElementById("speaker_icon").className = null;
    window.speechSynthesis.speak(speech);
}

function sendToGpt(text){
    recognition.stop();
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "https://api.openai.com/v1/chat/completions");

    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", "Bearer sess-xyz");

    xhr.onload = () => {
        if (xhr.readyState === xhr.DONE) {
            if (xhr.status === 200) {
              console.log(xhr.responseText);
              const obj = JSON.parse(xhr.responseText);
              let result = obj.choices[0].message.content;

              answer_span.innerHTML = result;
              talk(result)
            }
        }
    };

    let data = '{"messages":[{"role":"system","content":"';
    data += setup_span.value;
    data += '"}, {"role":"user","content":"';
    data += text;
    data += '"}],"temperature":0,"max_tokens":256,"top_p":1,"frequency_penalty":0, "presence_penalty":0,"model":"gpt-3.5-turbo","stream":false}';

    xhr.send(data);
}

function upgrade() {
  console.log('Upgrade your browser');
}

function startButton(event) {
  recognition.stop();
  if (recognizing) {
    document.getElementById("speaker_icon").className = null;
    return;
  }
  document.getElementById("speaker_icon").className = "blink";
  final_transcript = '';
  recognition.lang = 'en-EN';
  recognition.start();
  ignore_onend = false;
  final_span.innerHTML = '';
  interim_span.innerHTML = '';
  start_timestamp = event.timeStamp;
}

function askButton(event) {
    var text = document.getElementById("final_span").value;
    sendToGpt(removeEmojis(text));
}

function stopButton(event) {
    document.getElementById("robot_icon").className = null;
    window.speechSynthesis.cancel();
}
var two_line = /\n\n/g;
var one_line = /\n/g;
function linebreak(s) {
  return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
}

function capitalize(word) {
  if(word.charAt(0) != ' '){
    word = ' ' + word;
  }

  return word.charAt(1).toUpperCase() + word.slice(2);

}

function removeEmojis(str) {
  return str.replace(/[\u{1F000}-\u{1FFFF}]/gu, '');
}
