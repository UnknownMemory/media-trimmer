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

  const uploadBtn = () => {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gridArea: "Audio",
          flexDirection: "column",
        }}>
        <Button
          component="label"
          role={undefined}
          variant="contained"
          tabIndex={-1}
          sx={{ marginTop: "2rem", textTransform: "none" }}>
          Load file
          <VisuallyHiddenInput type="file" accept="audio/*" onChange={(event) => onUpload(event)} multiple />
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
