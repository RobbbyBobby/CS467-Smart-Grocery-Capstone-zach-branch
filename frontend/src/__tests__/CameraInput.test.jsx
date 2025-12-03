// Test was created with assistance from ChatGPT
// https://chatgpt.com/share/691fd594-3b94-800c-be70-94145bcef099
// https://chatgpt.com/share/6921e61a-1c58-800c-8eef-ecfd6069e1a0

import { render, screen, fireEvent } from "@testing-library/react";
import CameraInput from "../components/CameraInput.jsx";

describe("CameraInput Component", () => {
  // Mock createObjectURL so preview doesn't crash in JSDOM
  const mockCreateObjectURL = vi.fn(() => "mock-preview-url");

  beforeAll(() => {
    global.URL.createObjectURL = mockCreateObjectURL;
  });

  it("renders the file input", () => {
    render(<CameraInput />);
    const input = screen.getByLabelText(/camera-file-input/i);
    expect(input).toBeInTheDocument();
  });

  it("returns the selected file and calls onCapture", () => {
    const mockOnCapture = vi.fn();

    render(<CameraInput onCapture={mockOnCapture} />);

    const input = screen.getByLabelText(/camera-file-input/i);

    // Create fake file
    const file = new File(["dummy-image"], "test.jpg", { type: "image/jpeg" });

    // Trigger file selection
    fireEvent.change(input, { target: { files: [file] } });

    // Should call onCapture immediately with file
    expect(mockOnCapture).toHaveBeenCalledWith(file);

    // Preview should use createObjectURL
    expect(mockCreateObjectURL).toHaveBeenCalledWith(file);

    // Preview image should render
    const previewImg = screen.getByRole("img");
    expect(previewImg).toHaveAttribute("src", "mock-preview-url");
  });
});
