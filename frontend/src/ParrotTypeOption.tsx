import React from "react";
import "./ParrotTypeOption.css";

interface Props {
  value: string;
  imageUrl: string;
  onClickHandler: (value: string) => void;
  checked: boolean;
}

const ParrotTypeOption = ({
  imageUrl,
  value,
  onClickHandler,
  checked,
}: Props) => {
  return (
    <div className="partyTypeOption">
      <input
        required
        type="radio"
        id={value}
        name="ParrotTypeOption"
        value={value}
        aria-label={`Select party parrot style ${value.toUpperCase()}`}
        onChange={() => {
          onClickHandler(value);
        }}
        checked={checked}
      />
      <label htmlFor={value} className="partyTypeOptionLabel">
        <img
          src={imageUrl}
          alt={`Party parrot style ${value.toUpperCase()}`}
          className="partyTypeOptionImage"
          loading="lazy"
        />
        {value.toUpperCase()}
      </label>
    </div>
  );
};

export default ParrotTypeOption;
