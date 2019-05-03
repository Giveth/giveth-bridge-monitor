import React from "react";

export default function Web3Button(props) {
  if (props.show) {
    return <button onClick={props.onClick}>{props.text}</button>;
  } else {
    return null;
  }
}
