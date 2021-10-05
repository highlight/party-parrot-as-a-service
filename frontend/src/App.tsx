import React, { useEffect, useState } from "react";
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

function App() {
  const [parrots, setParrots] = useState<string[]>([]);
  const [currentTab, setCurrentTab] = useState(0);
  const [numberOfParrotsMade, setNumberOfParrotsMade] = useState(0);
  const [imageUrl, setImageUrl] = useState("");
  const [generatedParrotUrl, setGeneratedParrotUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getParrots = async () => {
      const { data } = await supabase.from("parrots").select("url");
      setParrots(
        (data || [])
          .map((row) => row.url)
          // Get an random subset of 20 party birds.
          .sort(() => 0.5 - Math.random())
          .slice(0, 20)
      );
      setNumberOfParrotsMade(data?.length || 0);
    };

    getParrots();
  }, []);

  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const form = new FormData();
    form.append("url", imageUrl);

    fetch(`${process.env.REACT_APP_BACKEND_URL}/party` || "", {
      method: "POST",
      body: form,
    }).then((response) => {
      response.text().then((url) => {
        setTimeout(() => {
          setGeneratedParrotUrl(url);
          setNumberOfParrotsMade((prev) => prev + 1);
          setIsLoading(false);
        }, 1000);
      });
    });
  };

  const getHeight = () => {
    switch (currentTab) {
      case 0:
        return 470;
      case 1:
        if (generatedParrotUrl === "" && !isLoading) {
          return 325;
        }
        return 470;
    }
  };

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


fetch("${process.env.REACT_APP_BACKEND_URL}/party", {
  "method": "POST",
  "headers": {
    "Content-Type": "multipart/form-data;"
  }
});`}</SyntaxHighlighter>
              </TabPanel>
              <TabPanel>
                <form onSubmit={onFormSubmit}>
                  {/* <input
              type="file"
              name="imageUpload"
              accept="image/*"
              aria-label="Upload image file"
            /> */}
                  <input
                    type="text"
                    name="imageURL"
                    aria-label="Image URL"
                    placeholder="Image URL"
                    className="urlInput"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                    }}
                  />

                  <button type="submit" className="button">
                    PARTY!
                  </button>
                </form>

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
                        onClick={() => {
                          if (navigator.clipboard) {
                            navigator.clipboard
                              .writeText(generatedParrotUrl)
                              .then(
                                () => {
                                  alert("Party parrot saved to clipboard.");
                                },
                                (err) => {
                                  console.log(
                                    "Failed to copy the text to clipboard.",
                                    err
                                  );
                                }
                              );
                          }
                        }}
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
