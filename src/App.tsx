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

  const onUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
    }
  };

  const uploadBtn = () => {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
          alignItems: "center",
        }}>
        <h1>Audio Trimmer</h1>
        <Button
          component="label"
          role={undefined}
          variant="contained"
          tabIndex={-1}
          sx={{ marginTop: "2rem", textTransform: "none" }}>
          Load audio file
          <VisuallyHiddenInput type="file" accept="audio/*" onChange={(event) => onUpload(event)} multiple />
        </Button>
      </Box>
    );
  };

  return (
    <>
      <Container maxWidth={false} fixed disableGutters>
        {!file && uploadBtn()}
        {file && <Player file={file} />}
      </Container>
    </>
  );
}

export default App;
