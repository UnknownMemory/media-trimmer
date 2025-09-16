import { useState, type ChangeEvent } from "react";
import "./App.css";
import Player from "./audio/player";
import { Box, Button, Container, styled } from "@mui/material";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

function App() {
  const [file, setFile] = useState<File>();
  const [title, setTitle] = useState<string>();

  const onUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setTitle(uploadedFile.name.substring(0, uploadedFile.name.lastIndexOf(".")));
    }
  };

  const loadExample = () => {
    fetch("./DJ YARI - EVERYTHING IS BUSINES PT.2.m4a").then((data) => {
      data.blob().then((blob) => {
        const file = new File([blob], "DJ YARI - EVERYTHING IS BUSINES PT.2.m4a", { type: "audio/m4a" });
        setFile(file);
        setTitle(file.name.substring(0, file.name.lastIndexOf(".")));
      })
    })
  }

  const uploadBtn = () => {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gridArea: "Audio",
        }}>
        <Button
          component="label"
          role={undefined}
          variant="contained"
          tabIndex={-1}
          sx={{ marginRight: "1rem", textTransform: "none" }}>
          Load file
          <VisuallyHiddenInput type="file" accept="audio/*" onChange={(event) => onUpload(event)} multiple />
        </Button>
        <Button
            component="label"
            role={undefined}
            variant="contained"
            tabIndex={-1}
            sx={{ textTransform: "none" }}>
          Load example file
          <VisuallyHiddenInput type="button" onClick={  loadExample} multiple />
        </Button>
      </Box>
    );
  };

  return (
    <>
      <Container maxWidth={false} fixed>
        <div className="trimmer">
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gridArea: "Header" }}>
            <Box sx={{ flexGrow: 1, flexBasis: 0 }}>
              <h1>Audio Trimmer</h1>
            </Box>
            <div>{title != "" && title}</div>
            <Box sx={{ flexGrow: 1, flexBasis: 0, display: "flex", justifyContent: "flex-end" }}>
              <Button component="label" role={undefined} variant="text" tabIndex={-1} sx={{ textTransform: "none" }}>
                Load file
                <VisuallyHiddenInput type="file" accept="audio/*" onChange={(event) => onUpload(event)} multiple />
              </Button>
            </Box>
          </Box>
          {!file && uploadBtn()}
          {file && <Player file={file} />}
        </div>
      </Container>
    </>
  );
}

export default App;
