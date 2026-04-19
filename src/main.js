import ollama from 'ollama';
import axios from 'axios';

const queryButton = document.getElementById("query");
const locationInput = document.getElementById("locationInput");
const durationInput = document.getElementById("durationInput");

const interstitialLoader = document.getElementById("loader");

const modal = document.getElementById("tripModal");
const modalTitle = document.getElementById("modalTitle");
const closeButton = document.querySelector("close");

const outputBox = document.getElementById("outputBox");
const locationImage = document.getElementById("locationImage");
const previousImage = document.getElementById("previousImage");
const nextImage = document.getElementById("nextImage");

// Message that the LLM will be prompted with.
const systemMessage = `You are an A.I. agent designed to assist in planning a travel internary for the user. 
First, return a short description about the city's history, culture, etc. in a single object literal.

Next, return location objects in a locations list with the following information:
1) Name of location
2) Short Description of the location
3) The location's address
Don't repeat locations. 

Match the amount of locations to the user's duration of stay.
`

// Runs on the user submitting information
queryButton.addEventListener('click', async function () {
  const location = locationInput.value;
  const duration = durationInput.value;

  // Ensure that the user has entered a location and duration
  if (!location || !duration) {
    alert("Please enter a location and duration!");
    return;
  }

  // Show loading spinner
  interstitialLoader.style.display = "block";

  // SFX for loading
  const sbSound = new Audio('/Seatbelt-sound-effect.mp3');
  const jazz = new Audio('/Backbay Lounge.mp3');


  function endLoad(err = null) {
    jazz.pause();
    interstitialLoader.style.display = "none";

    if (err) {
      console.error(err.message);
      alert("There's been an error on our end! Please try again later.");
    } else {
      modal.style.display = "block";
    }
  }

  // Allows the seatbelt sound to finish before playing the jazz
  await new Promise(resolve => {
    sbSound.onended = resolve;
    sbSound.play();
  })
  jazz.play();

  // Queries the backend at server.js to recieve photos for the location
  console.log(`Fetching images of ${location}`);
  try {
    const imageResponse = await axios.get("http://localhost:3000/images", {
      params: {
        q: `${location} photos`,
      }
    })
  } catch (err) {
    endLoad(err);
    return;
  }
  console.log("Images fetched!")
  const images = imageResponse.data;

  // Gets the LLM's response with the variables given by the user
  console.log(`Querying with:\nlocation: ${location}\nduration: ${duration}`)
  try {
    const response = await ollama.chat({
      model: 'qwen2.5vl:3b',
      messages: [{ role: 'system', content: systemMessage }, { role: 'user', content: `location: ${location} duration: ${duration}` }],
      format: 'json'
    });
  } catch (err) {
    endLoad(err);
    return;
  }
  console.log("Locations fetched!");
  const details = JSON.parse(response.message.content);

  // Create an itinerary HTML container with the different location information
  let itinerary = details.history + "\n\n";

  for (let j = 0; j < details.locations.length; j++) {
    const location = details.locations[j];
    itinerary += `<locationName>${j + 1}) ${location.name}</locationName>\n`
    itinerary += `<locationDesc>${location.description}</locationDesc>\n`
    itinerary += `<locationAddr>${location.address}</locationAddr>\n\n`
  }

  // Image carousel functionality
  let i = 0;

  function setImage() {
    locationImage.src = images.images_results[i].thumbnail;
  }
  setImage();

  previousImage.addEventListener('click', function () {
    if (i == 0) {
      i = 99;
    } else {
      i--;
    }
    setImage();
  })
  nextImage.addEventListener('click', function () {
    if (i == 99) {
      i = 0;
    } else {
      i++;
    }
    setImage();
  });

  // Set HTML content to the recieved content
  modalTitle.textContent = location;
  outputBox.innerHTML = '<p>' + itinerary + '</p>';

  // End Interstitial
  endLoad();

  // Modal exit functionality
  window.addEventListener("click", function (event) {
    event.preventDefault();
    if (event.target === modal || event.target === closeButton) {
      modal.style.display = "none";
    }
  });

})