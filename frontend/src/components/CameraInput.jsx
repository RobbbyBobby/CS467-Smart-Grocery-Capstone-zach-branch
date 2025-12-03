// Component that gets an image input from the user's camera
// Component was created with assistance from ChatGPT
// https://chatgpt.com/share/691fd594-3b94-800c-be70-94145bcef099
// https://chatgpt.com/share/6921e61a-1c58-800c-8eef-ecfd6069e1a0
// https://chatgpt.com/c/6923cabf-1ca0-8327-ab90-ff8ca72d9386

import React, { useState, useRef } from "react";

export default function CameraInput({ onCapture, ref }) {
  const [currentImgType, setCurrentImgType] = useState(null);

  // Ref to the hidden input
  const fileInputRef = useRef(null);

  // Expose openCamera to parent
  if (ref) {
    ref.current = {
      openCamera: (imgType) => {
        setCurrentImgType(imgType);   // store the type in state
        fileInputRef.current?.click();
      }
    };
  }

  const handleCapture = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);

    if (onCapture) {
      onCapture({ file, previewUrl, imgType: currentImgType });
    }

    // Reset input value so the same file can be uploaded again if needed
    event.target.value = "";
  };

  return (
    <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCapture}
        style={{ display: "none" }} // Hide file input
    />

  );
};

