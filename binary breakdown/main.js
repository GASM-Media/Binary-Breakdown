let playmode = {
  oneShot: false,
  pause: false,
  loop: true,
};

// TO IMPLEMENT:
// playback selection details
// let playback = {
//   currentMode: "normal_playback",
//   modes: ["normal_playback", "delay_Playback", "delay_playback_random"],
//   delay_time_ms: 500,
//   delay_playback_random_range_ms: 100,
// };

// sample selection
// current sample
// currently selected samples
// available samples
// unlocked samples

let audioState = {
  binary: "",
  audioIndex: 0,
  currentIndex: -1,
};

let audioElements = []; // Store audio elements for stopping

function textToBinary(text) {
  let binary = "";
  for (let i = 0; i < text.length; i++) {
    let charCode = text.charCodeAt(i).toString(2);
    binary += "0".repeat(8 - charCode.length) + charCode;
  }
  document.getElementById("binary_code").innerHTML = binary;
  return binary; // Return the binary string
}

const audioPlaybackDelay = 500; // Adjust this value to control the playback speed (in milliseconds)

function playNextAudio() {
  const binary = audioState.binary; // Get the binary value
  if (playmode.loop && audioState.audioIndex >= binary.length) {
    audioState.audioIndex = 0; // Reset index for loop mode
  }

  if (playmode.oneShot && audioState.audioIndex >= binary.length) {
    stopAudio();
    audio.pause();
  }

  if (audioState.audioIndex < binary.length) {
    const audioValue = binary[audioState.audioIndex];
    let audio = new Audio(
      audioValue === "0" ? "./Media/1a.mp3" : "./Media/1b.mp3"
    );

    audioElements.push(audio);

    audioState.currentIndex = audioState.audioIndex;

    audio.onended = () => {
      audioState.currentIndex = -1; // Clear currentIndex when audio ends
      audioState.audioIndex++;

      if (playmode.loop && audioState.audioIndex >= binary.length) {
        audioState.audioIndex = 0; // Reset index for loop mode
        playNextAudio(); // Continue playing from the beginning
      } else {
        playNextAudio(); // Continue playing next audio
      }

      // Remove the audio element from the array after playback
      const indexToRemove = audioElements.indexOf(audio);
      if (indexToRemove !== -1) {
        audioElements.splice(indexToRemove, 1);
      }

      // Determine the background color based on the audio value
      const backgroundColor =
        audioValue === "0"
          ? document.getElementById("color0Picker").value
          : document.getElementById("color1Picker").value;
      document.body.style.backgroundColor = backgroundColor;
      document.body.classList.add("fade-animation");

      setTimeout(() => {
        document.body.classList.remove("fade-animation");
        document.body.style.backgroundColor = ""; // Reset background color
      }, 500); // Remove the class after the animation duration (0.5 seconds)
    };

    audio.play().catch((error) => {
      console.error("Error playing audio:", error);
      // Remove the audio element from the array in case of error
      const indexToRemove = audioElements.indexOf(audio);
      if (indexToRemove !== -1) {
        audioElements.splice(indexToRemove, 1);
      }
    });
  }
}

function updateBinary(text) {
  audioState.binary = textToBinary(text); // Update the binary string
  if (playmode.loop) {
    playNextAudio(); // Play with the updated binary value
  }
  updateHighlight(); // Update the highlighting immediately
}

function updateHighlight() {
  if (audioState.currentIndex !== -1) {
    document.getElementById("binary_code").innerHTML = createBinaryHTML(
      audioState.binary,
      audioState.currentIndex
    );
  }
}

// Update the highlighting continuously while audio playback is happening
function updateHighlightLoop() {
  updateHighlight();
  requestAnimationFrame(updateHighlightLoop);
}

requestAnimationFrame(updateHighlightLoop);

// function stopAudio() {
//   updateButtonStyles();
//   audioElements.forEach((audio) => {
//     audio.pause();
//     audio.currentTime = 0;
//     audio.onended = null;
//   });
//   audioElements = [];
//   audioState.audioIndex = 0; // Reset audio index
//   audioState.currentIndex = -1; // Reset current index

//   // Add the "active" class to the stopAudioButton
//   // document.getElementById("stopAudioButton").classList.add("active");
// }

// function playLoop() {
//   playmode.loop = true;
//   playmode.oneShot = false;
//   updateBinary(document.getElementById("myInput").value);
//   updateButtonStyles();
// }

// function playOneShot() {
//   playmode.oneShot = true;
//   playmode.loop = false;
//   updateBinary(document.getElementById("myInput").value);
//   updateButtonStyles();
// }

// function updateButtonStyles() {
//   const loopButton = document.getElementById("loopButton");
//   const oneShotButton = document.getElementById("oneShotButton");
//   const stopAudioButton = document.getElementById("stopAudioButton");

//   loopButton.classList.toggle("active", playmode.loop);
//   oneShotButton.classList.toggle("active", playmode.oneShot);
//   stopAudioButton.classList.toggle("active", audioElements.length > 0);
// }

function playLoop() {
  playmode.loop = true;
  playmode.oneShot = false;
  updateBinary(document.getElementById("myInput").value);
  updateButtonStyles("loopButton");
}

function playOneShot() {
  playmode.oneShot = true;
  playmode.loop = false;
  updateBinary(document.getElementById("myInput").value);
  updateButtonStyles("oneShotButton");
}

function stopAudio() {
  if (audioElements.length > 0) {
    updateButtonStyles("stopAudioButton");
    audioElements.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
      audio.onended = null;
    });
    audioElements = [];
    audioState.audioIndex = 0; // Reset audio index
    audioState.currentIndex = -1; // Reset current index
  }
}

function updateButtonStyles(activeButtonId) {
  const loopButton = document.getElementById("loopButton");
  const oneShotButton = document.getElementById("oneShotButton");
  const stopAudioButton = document.getElementById("stopAudioButton");

  loopButton.classList.toggle("active", loopButton.id === activeButtonId);
  oneShotButton.classList.toggle("active", oneShotButton.id === activeButtonId);
  stopAudioButton.classList.toggle(
    "active",
    stopAudioButton.id === activeButtonId
  );
}

// Programmatically create HTML highlighting current position in the binary string
function createBinaryHTML(binary, currentIndex) {
  let html = "";
  for (let i = 0; i < binary.length; i++) {
    if (i === currentIndex) {
      html += '<span class="current">' + binary[i] + "</span>";
    } else {
      html += binary[i];
    }
  }
  return html;
}
