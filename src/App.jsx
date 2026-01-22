import React, { useEffect, useRef, useState } from "react";
import img from "./ai-human.avif";

const App = () => {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [information, setInformation] = useState("");
  const [voices, setVoice] = useState([]);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef(null);

  // ------------------- SETUP SPEECH RECOGNITION (CLIENT SIDE ONLY) -------------------
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        console.log("❌ Speech Recognition not supported");
        setIsSupported(false);
        return;
      }

      console.log("✅ Speech Recognition supported");

      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        console.log("🎤 Recognition started");
      };

      recognition.onresult = (event) => {
        const spokenText = event.results[0][0].transcript.toLowerCase();
        console.log("You said:", spokenText);
        setTranscript(spokenText);
        handleVoiceCommand(spokenText);
      };

      recognition.onerror = (event) => {
        console.log("❌ Recognition error:", event.error);
      };

      recognition.onend = () => {
        console.log("🎤 Recognition ended");
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // ------------------- LOAD VOICES PROPERLY -------------------
  const loadVoice = () => {
    const allVoices = window.speechSynthesis.getVoices();
    if (allVoices.length > 0) {
      setVoice(allVoices);
      console.log("🔊 Voices loaded:", allVoices);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      loadVoice();
      window.speechSynthesis.onvoiceschanged = loadVoice;
    }
  }, []);

  // ------------------- START LISTENING -------------------
  const startListening = () => {
    if (!recognitionRef.current) {
      alert("Speech Recognition not supported. Please use Google Chrome.");
      return;
    }

    recognitionRef.current.start();
    setIsListening(true);
  };

  // ------------------- SPEAK TEXT (TEXT TO SPEECH) -------------------
  const speakText = (text) => {
    if (!window.speechSynthesis) {
      alert("Speech synthesis not supported in this browser.");
      return;
    }

    // Cancel any previous speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Choose a safe English voice
    let selectedVoice = null;

    if (voices.length > 0) {
      selectedVoice =
        voices.find((voice) => voice.lang.startsWith("en")) || voices[0];
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    } else {
      utterance.lang = "en-US";
    }

    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    console.log("🔊 Speaking:", text);

    // Chrome audio fix
    window.speechSynthesis.resume();
    window.speechSynthesis.speak(utterance);
  };

  // ------------------- HANDLE VOICE COMMAND -------------------
  const handleVoiceCommand = async (command) => {
    command = command.toLowerCase().trim();

    if (command.startsWith("friday ")) {
      command = command.replace("friday ", "");
    }

    if (command.startsWith("open ")) {
      const site = command.split("open ")[1].trim();

      const sitesMap = {
        youtube: "https://www.youtube.com",
        facebook: "https://www.facebook.com",
        google: "https://www.google.com",
        twitter: "https://www.twitter.com",
        instagram: "https://www.instagram.com",
      };

      if (sitesMap[site]) {
        speakText(`Opening ${site}`);
        window.open(sitesMap[site], "_blank");
        setInformation(`Opened ${site}`);
      } else {
        speakText(`I don't know how to open ${site}`);
        setInformation(`Could not find the website for ${site}`);
      }
      return;
    }

    if (command.includes("what is your name")) {
      const response =
        "Hello Sir I'm Friday, your voice assistant created by Prashant Yadav";
      speakText(response);
      setInformation(response);
      return;
    } else if (command.includes("hi friday")) {
      const response = "Hello sir, what are you looking for today";
      speakText(response);
      setInformation(response);
      return;
    } else if (command.includes("what is your age")) {
      const response = "Hello Sir I'm Friday, I'm 5 months old";
      speakText(response);
      setInformation(response);
      return;
    } else if (command.includes("who is your creator")) {
      const response = "Hello Sir Mr. Yadav is my creator";
      speakText(response);
      setInformation(response);
      return;
    }

    const famousPeople = [
      "bill gates",
      "mark zuckerberg",
      "elon musk",
      "steve jobs",
      "warren buffet",
      "barack obama",
      "jeff bezos",
      "sundar pichai",
      "mukesh ambani",
      "virat kohli",
      "sachin tendulkar",
      "brian lara",
    ];

    if (famousPeople.some((person) => command.includes(person))) {
      const person = famousPeople.find((person) => command.includes(person));
      const personData = await fetchPersonData(person);

      if (personData) {
        const infoText = `${personData.name}, ${personData.extract}`;
        setInformation(infoText);
        speakText(infoText);
        performGoogleSearch(command);
      } else {
        const fallbackMessage = "I couldn't find detailed information";
        speakText(fallbackMessage);
        performGoogleSearch(command);
      }
    } else {
      const fallbackMessage = `Here is the information about ${command}`;
      speakText(fallbackMessage);
      performGoogleSearch(command);
    }
  };

  // ------------------- FETCH WIKIPEDIA DATA -------------------
  const fetchPersonData = async (person) => {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
      person
    )}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data && data.title && data.extract) {
        return {
          name: data.title,
          extract: data.extract.split(".")[0],
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error("error");
      return null;
    }
  };

  // ------------------- GOOGLE SEARCH -------------------
  const performGoogleSearch = (query) => {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(
      query
    )}`;
    window.open(searchUrl, "_blank");
  };

  // ------------------- UI -------------------
  return (
    <div>
      <div className="voice-assistant">
        <img src={img} alt="AI" className="ai-image" />
        <h2>Voice Assistant (Friday)</h2>

        {!isSupported && (
          <p style={{ color: "red" }}>
            Speech Recognition works only in Google Chrome browser.
          </p>
        )}

        <button className="btn" onClick={startListening} disabled={isListening}>
          <i className="fas fa-microphone"></i>
          {isListening ? "Listening..." : "Start Listening"}
        </button>

        <p className="tarnscript">{transcript}</p>
        <p className="information">{information}</p>
      </div>
    </div>
  );
};

export default App;
