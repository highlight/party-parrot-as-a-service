import React, { useEffect, useState, useCallback } from "react";
import CountUp from "react-countup";
import "./App.css";
import ParrotExample from "./ParrotExample";
import { supabase } from "./supabaseClient";
import { Tabs, TabList, Tab, TabPanels, TabPanel } from "@reach/tabs";
import SyntaxHighlighter from "react-syntax-highlighter";
import { shadesOfPurple } from "react-syntax-highlighter/dist/esm/styles/hljs";
import AnimateHeight from "react-animate-height";
import Logo from "./logo.svg";
import HardHadParrot from "./hardhatparrot.gif";
import ParrotTypeOption from "./ParrotTypeOption";

// Types
interface ParrotData {
  url: string;
}

// Constants
const DISPLAY_PARROT_COUNT = 20;
const SUCCESS_DELAY = 1000;
const MOBILE_BREAKPOINT = 505;

function App() {
  const [parrots, setParrots] = useState<string[]>([]);
  const [currentTab, setCurrentTab] = useState(0);
  const [numberOfParrotsMade, setNumberOfParrotsMade] = useState(0);
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<null | File>(null);
  const [generatedParrotUrl, setGeneratedParrotUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [type, setType] = useState("a");
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const getParrots = async () => {
      try {
        const { data, error } = await supabase.from("parrots").select("url");

        if (error) {
          console.error("Error fetching parrots:", error);
          setError("Failed to load party parrots. Please try again later.");
          return;
        }

        if (data) {
          const urls = data.map((row: ParrotData) => row.url);
          // More efficient random selection using Fisher-Yates shuffle
          const shuffled = [...urls];
          for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
          }
          setParrots(shuffled.slice(0, DISPLAY_PARROT_COUNT));
          setNumberOfParrotsMade(data.length);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("An unexpected error occurred. Please try again later.");
      }
    };

    getParrots();
  }, []);

  const onFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const form = new FormData();
      form.append("url", imageUrl);

      if (imageFile) {
        form.append("image", imageFile, imageFile.name);
      } else {
        form.append("type", type);
      }

      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      if (!backendUrl) {
        throw new Error("Backend URL is not configured");
      }

      const response = await fetch(`${backendUrl}/party`, {
        method: "POST",
        body: form,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      const url = await response.text();

      // Add a delay for better UX
      setTimeout(() => {
        setGeneratedParrotUrl(url);
        setNumberOfParrotsMade((prev) => prev + 1);
        setIsLoading(false);
      }, SUCCESS_DELAY);
    } catch (err) {
      console.error("Error creating party parrot:", err);
      setError(err instanceof Error ? err.message : "Failed to create party parrot. Please try again.");
      setIsLoading(false);
    }
  };

  const getHeight = useCallback(() => {
    const isMobile = window.innerWidth < MOBILE_BREAKPOINT;

    switch (currentTab) {
      case 0: // API tab
        return isMobile ? 665 : 570;

      case 1: // Web tab
        if (generatedParrotUrl === "" && !isLoading) {
          return isMobile ? 535 : 425;
        }
        if (isLoading) {
          return isMobile ? 675 : 570;
        }
        return isMobile ? 665 : 570;

      default:
        return isMobile ? 535 : 425;
    }
  }, [currentTab, generatedParrotUrl, isLoading]);

  const handleCopyToClipboard = useCallback(async () => {
    if (!generatedParrotUrl) return;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(generatedParrotUrl);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = generatedParrotUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }

      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
      setError("Failed to copy to clipboard. Please copy the URL manually.");
    }
  }, [generatedParrotUrl]);

  return (
    <div className="App">
      <div className="parrotExampleContainer">
        {parrots.map((parrotImageUrl) => (
          <ParrotExample parrotImageUrl={parrotImageUrl} key={parrotImageUrl} />
        ))}
      </div>
      <AnimateHeight duration={200} height={getHeight()} className="card glass">
        <header>
          <h1>Party Parrot as a Service</h1>
          <p>Your one stop shop for all party parrot needs.</p>
        </header>
        <main>
          <Tabs
            onChange={(i) => {
              setCurrentTab(i);
            }}
          >
            <TabList>
              <Tab>API</Tab>
              <Tab>Web</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <h3>Send us an image URL</h3>

                <SyntaxHighlighter
                  language="javascript"
                  style={shadesOfPurple}
                >{`const form = new FormData();

form.append(
  "url",
  "https://web.com/pic.png"
);

form.append(
  "type",
  "b" // Supported types: 'a', 'b', 'c', 'd'
);


fetch("${process.env.REACT_APP_BACKEND_URL}/party", {
  "method": "POST",
  "headers": {
    "Content-Type": "multipart/form-data;"
  }
});`}</SyntaxHighlighter>
              </TabPanel>
              <TabPanel>
                <form onSubmit={onFormSubmit}>
                  <div className="parrotTypeOptionContainer">
                    <ParrotTypeOption
                      value="a"
                      imageUrl="https://gbpohqmsjdcrrrwshczg.supabase.in/storage/v1/object/public/party-parrots/party-parrots/5fcebc0d-7bea-4076-82bf-14d9c9a39088.gif"
                      onClickHandler={setType}
                      checked={type === "a"}
                    />
                    <ParrotTypeOption
                      value="b"
                      imageUrl="https://gbpohqmsjdcrrrwshczg.supabase.in/storage/v1/object/public/party-parrots/party-parrots/5fcccee4-0040-4b2c-a8eb-baa200085f3a.gif"
                      onClickHandler={setType}
                      checked={type === "b"}
                    />
                    <ParrotTypeOption
                      value="c"
                      imageUrl="https://gbpohqmsjdcrrrwshczg.supabase.in/storage/v1/object/public/party-parrots/party-parrots/b898ffaf-73b7-4a6a-9032-a61e25d68720.gif"
                      onClickHandler={setType}
                      checked={type === "c"}
                    />
                    <ParrotTypeOption
                      value="d"
                      imageUrl="https://gbpohqmsjdcrrrwshczg.supabase.in/storage/v1/object/public/party-parrots/party-parrots/131bded5-02b0-4595-89c0-e8bc62ef4226.gif"
                      onClickHandler={setType}
                      checked={type === "d"}
                    />
                  </div>

                  <div className="imageInputContainer">
                    <input
                      required={!imageFile}
                      type="url"
                      name="imageURL"
                      aria-label="Image URL"
                      placeholder="Image URL"
                      className="urlInput"
                      value={imageUrl}
                      onChange={(e) => {
                        setImageUrl(e.target.value);
                      }}
                    />
                    {/* <label htmlFor="imageUpload" className="customFileUpload">
                      <input
                        type="file"
                        id="imageUpload"
                        name="imageUpload"
                        accept="image/*"
                        aria-label="Upload image file"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setImageFile(e.target.files[0]);
                          }
                        }}
                      />
                      {imageFile ? (
                        <img
                          src={URL.createObjectURL(imageFile)}
                          alt=""
                          className="imagePreview"
                        />
                      ) : (
                        <div className="uploadIconContainer">
                          <svg
                            width="24"
                            height="24"
                            viewBox="4 4 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="uploadIcon"
                          >
                            <path
                              d="M6.25 14.25C6.25 14.25 4.75 14 4.75 12C4.75 10.2869 6.07542 8.88339 7.75672 8.75897C7.88168 6.5239 9.73368 4.75 12 4.75C14.2663 4.75 16.1183 6.5239 16.2433 8.75897C17.9246 8.88339 19.25 10.2869 19.25 12C19.25 14 17.75 14.25 17.75 14.25"
                              stroke="currentColor"
                              stroke-width="1.5"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            ></path>
                            <path
                              d="M14.25 15.25L12 12.75L9.75 15.25"
                              stroke="currentColor"
                              stroke-width="1.5"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            ></path>
                            <path
                              d="M12 19.25V13.75"
                              stroke="currentColor"
                              stroke-width="1.5"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            ></path>
                          </svg>
                        </div>
                      )}
                    </label> */}
                  </div>

                  <button type="submit" className="button">
                    PARTY!
                  </button>
                </form>

                {error && (
                  <div className="errorContainer" style={{
                    padding: '1rem',
                    marginTop: '1rem',
                    backgroundColor: '#fee',
                    border: '1px solid #fcc',
                    borderRadius: '8px',
                    color: '#c33'
                  }}>
                    <p>{error}</p>
                    <button
                      onClick={() => setError(null)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#c33',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                {copySuccess && (
                  <div className="successContainer" style={{
                    padding: '1rem',
                    marginTop: '1rem',
                    backgroundColor: '#efe',
                    border: '1px solid #cfc',
                    borderRadius: '8px',
                    color: '#363'
                  }}>
                    <p>Party parrot URL copied to clipboard!</p>
                  </div>
                )}

                {isLoading && (
                  <div className="loadingContainer">
                    <img src={HardHadParrot} alt="" />
                    <p>Parrots are hard at work...</p>
                  </div>
                )}
                {generatedParrotUrl !== "" && (
                  <div className="parrotPreviewContainer">
                    <img
                      src={generatedParrotUrl}
                      alt=""
                      className="parrotPreview"
                    />
                    <div className="urlContainer">
                      <p>{generatedParrotUrl}</p>
                      <button
                        className="copyButton"
                        onClick={handleCopyToClipboard}
                        title={copySuccess ? "Copied!" : "Copy to clipboard"}
                        aria-label="Copy party parrot URL to clipboard"
                      >
                        <svg
                          width="24"
                          height="24"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="1.5"
                            d="M6.5 15.25V15.25C5.5335 15.25 4.75 14.4665 4.75 13.5V6.75C4.75 5.64543 5.64543 4.75 6.75 4.75H13.5C14.4665 4.75 15.25 5.5335 15.25 6.5V6.5"
                          ></path>
                          <rect
                            width="10.5"
                            height="10.5"
                            x="8.75"
                            y="8.75"
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="1.5"
                            rx="2"
                          ></rect>
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </main>
      </AnimateHeight>
      <p className="counter">
        <CountUp end={numberOfParrotsMade} duration={1} preserveValue />{" "}
        <span className="emphasis">party parrots</span> have been created.
      </p>
      <div className="glass attribution">
        By{" "}
        <a href="https://highlight.run">
          <img src={Logo} alt="Highlight" />
        </a>
      </div>
    </div>
  );
}

export default App;
