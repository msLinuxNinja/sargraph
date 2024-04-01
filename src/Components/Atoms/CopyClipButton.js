import { useState } from "react";
import { Button } from "antd";

export default function CopyClipboardButton(props) {
  const [buttonText, setButtonText] = useState("Copy to Clipboard");

  const supportedBrowser = navigator.clipboard && navigator.clipboard.write; // Verify if browser supports ClipboardItem API

  function handleCopy() {
    const canvas = props.chartRef.current.canvas; // Obtain current canvas
    canvas.toBlob(async (blob) => {
      const items = [new ClipboardItem({ 'image/png': blob })]; // Note: does not work in Firefox
      await navigator.clipboard.write(items);
    }); // Copy canvas to clipboard

    // Change button text to "Copied!"
    setButtonText("Copied!");

    // Change it back to "Copy to Clipboard" after 3 seconds
    setTimeout(() => {
      setButtonText("Copy to Clipboard");
    }, 3000);
  }

  return (
    <>
      {supportedBrowser ? (
          <Button type="primary" onClick={handleCopy}>
            {buttonText}
          </Button>
      ) : (
        null
      )}
    </>
  );
}
