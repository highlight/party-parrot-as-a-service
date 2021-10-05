import React, { useEffect, useState } from "react";
import CountUp from "react-countup";
import "./App.css";
import ParrotExample from "./ParrotExample";
import { supabase } from "./supabaseClient";
import { Tabs, TabList, Tab, TabPanels, TabPanel } from "@reach/tabs";
import SyntaxHighlighter from "react-syntax-highlighter";
import { shadesOfPurple } from "react-syntax-highlighter/dist/esm/styles/hljs";
import AnimateHeight from "react-animate-height";

function App() {
  const [parrots, setParrots] = useState<string[]>([]);
  const [currentTab, setCurrentTab] = useState(0);
  const [numberOfParrotsMade, setNumberOfParrotsMade] = useState(0);
  const [imageUrl, setImageUrl] = useState("");

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
    setNumberOfParrotsMade((prev) => prev + 1);
    fetch(process.env.REACT_APP_BACKEND_URL || "");
    console.log(imageUrl);
  };

  const getHeight = () => {
    console.log(currentTab);
    switch (currentTab) {
      case 0:
        return "500px";
      case 1:
        return "550px";
    }
  };

  return (
    <div className="App">
      <div className="parrotExampleContainer">
        {parrots.map((parrotImageUrl) => (
          <ParrotExample parrotImageUrl={parrotImageUrl} key={parrotImageUrl} />
        ))}
      </div>
      <AnimateHeight
        duration={200}
        height={`${getHeight()}`}
        className="card glass"
      >
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

                  <button type="submit">PARTY!</button>
                </form>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </main>
      </AnimateHeight>
      <p className="counter">
        <CountUp end={numberOfParrotsMade} duration={1} preserveValue />{" "}
        <span className="emphasis">party parrots</span> have been created.
      </p>
    </div>
  );
}

export default App;
