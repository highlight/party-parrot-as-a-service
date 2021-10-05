import React, { ReactElement } from "react";
import "./App.css";

interface Props {
  parrotImageUrl: string;
}

function ParrotExample({ parrotImageUrl }: Props): ReactElement {
  return (
    <div
      className="parrotExample glass"
      key={parrotImageUrl}
      style={{
        animationDelay: `${Math.random() * 30.3 + 0.1}s`,
      }}
    >
      <img src={parrotImageUrl} alt="" />
    </div>
  );
}

export default React.memo(ParrotExample);
