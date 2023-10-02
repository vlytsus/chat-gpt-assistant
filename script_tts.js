let speech
let voices = []; // global array of available voices
let console_log

window.onload = () => {
    document.querySelector("#voices").addEventListener("change", () => {
    speech.voice = voices[document.querySelector("#voices").value];
    });


    console_log = window.console.log;
    window.console.log = function(...args){
        console_log(...args);
        var textarea = document.getElementById('my_console');
        var tmp = textarea.value;
        args.forEach(arg=>textarea.value=arg+'\n========================================================================\n'+tmp);
    }

speech = new SpeechSynthesisUtterance();

speech.addEventListener('end', () => {
    document.getElementById("robot_icon").className = null;
    document.getElementById("speaker_icon").className = "blink";
    recognition.start();
});

speech.addEventListener('error', (err) => {
    console.log('err ' + err);
 });


window.speechSynthesis.onvoiceschanged = () => {

  voices = window.speechSynthesis.getVoices();
  speech.voice = voices[0];

  let voiceSelect = document.querySelector("#voices");
  for (let i = 0; i < voices.length; i++) {

      if(voices[i].lang.includes("en")){
         voiceSelect.options[i] = new Option(voices[i].name, i, true, true);
         speech.voice = voices[i];
      } else {
        voiceSelect.options[i] = new Option(voices[i].name, i);
      }
  }

};

}





