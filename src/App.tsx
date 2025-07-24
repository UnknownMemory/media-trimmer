import { useState, type ChangeEvent } from "react";
import "./App.css";
import Player from "./audio/player";

function App() {
  const [file, setFile] = useState<File>();

  const onUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
    }
  };

  return (
    <>
      {!file && <input type="file" name="audio" id="audio" accept="audio/*" onChange={(e) => onUpload(e)} />}
      {file && <Player file={file} />}
    </>
  );
}

export default App;
