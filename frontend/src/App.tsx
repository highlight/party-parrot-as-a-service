import React, { useEffect, useState } from "react";
import CountUp from "react-countup";
import "./App.css";
import ParrotExample from "./ParrotExample";
import { supabase } from "./supabaseClient";

function App() {
  const [parrots, setParrots] = useState<string[]>([]);
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

  return (
    <div className="App">
      <div className="parrotExampleContainer">
        {parrots.map((parrotImageUrl) => (
          <ParrotExample parrotImageUrl={parrotImageUrl} key={parrotImageUrl} />
        ))}
      </div>
      <div className="card glass">
        <header>
          <h1>Party Parrot as a Service</h1>
        </header>
        <main>
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
        </main>
      </div>
      <p>
        <CountUp end={numberOfParrotsMade} duration={1} preserveValue />{" "}
        <span className="emphasis">party parrots</span> have been created.
      </p>
    </div>
  );
}

export default App;
