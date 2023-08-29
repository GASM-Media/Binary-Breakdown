let playmode = {
  oneShot: false,
  pause: false,
  loop: true,
};

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

function stopAudio() {
  audioElements.forEach((audio) => {
    audio.pause();
    audio.currentTime = 0;
    audio.onended = null;
  });
  audioElements = [];
  audioState.audioIndex = 0; // Reset audio index
  audioState.currentIndex = -1; // Reset current index
}

const audioPlaybackDelay = 500; // Adjust this value to control the playback speed (in milliseconds)

function playNextAudio() {
  const binary = audioState.binary; // Get the binary value
  if (playmode.loop && audioState.audioIndex >= binary.length) {
    audioState.audioIndex = 0; // Reset index for loop mode
  }

  if (audioState.audioIndex < binary.length) {
    let audio = new Audio(
      binary[audioState.audioIndex] === "0" ? "./Media/0.mp3" : "./Media/1.mp3"
    );

    console.log("Playing audio:", audio.src);

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
    stopAudio(); // Stop any ongoing audio before starting new playback
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

function playLoop() {
  playmode.loop = true;
  playmode.oneShot = false;
  updateBinary(document.getElementById("myInput").value);
  updateButtonStyles();
}

function playOneShot() {
  playmode.oneShot = true;
  playmode.loop = false;
  updateBinary(document.getElementById("myInput").value);
  updateButtonStyles();
}

function updateButtonStyles() {
  const loopButton = document.getElementById("loopButton");
  const oneShotButton = document.getElementById("oneShotButton");

  loopButton.classList.toggle("active", playmode.loop);
  oneShotButton.classList.toggle("active", playmode.oneShot);
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
