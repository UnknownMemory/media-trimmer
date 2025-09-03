import { useEffect, useState } from "react";
import Slider from "@mui/material/Slider";
import "./player.css";

import Waveform from "./waveform";
import useAudioPlayer from "../../hooks/useAudioPlayer";
import ExportDialog from "../export/dialog";
import { Box, Button, CircularProgress, IconButton, Stack } from "@mui/material";
import { PauseCircleFilled, PlayCircleFilled, VolumeDown, VolumeUp } from "@mui/icons-material";

interface Props {
  file: File;
}

function Player({ file }: Props) {
  const [volume, setVolume] = useState<number>(50);
  const [open, setOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const {
    loadFile,
    play,
    pause,
    updateVolume,
    trackDuration,
    trackLoaded,
    trimDuration,
    isPlaying,
    playbackTimeAtStart,
    setTrimDuration,
  } = useAudioPlayer();

  const handleChange = (_: Event, newValue: number[]) => {
    pause();
    playbackTimeAtStart.current = newValue[0];
    setTrimDuration(newValue);
    play();
  };

  const togglePlay = async () => {
    if (!isPlaying) {
      await play();
    } else {
      pause();
    }
  };

  const openDialog = () => {
    if (!open) {
      if (isPlaying) pause();
      setOpen(true);
    }
  };

  const handleVolume = (_: Event, value: number) => {
    setVolume(value);
    updateVolume(value);
  };

  useEffect(() => {
    setIsLoading(true);
    loadFile(file);
  }, [file, loadFile]);

  return (
    <>
      <Box
        sx={{
          backgroundColor: "#32363c",
          borderRadius: "1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gridArea: "Audio",
          padding: "0 1rem",
          position: "relative",
        }}>
        {isLoading && (
          <Box
            width={"100%"}
            height={"100%"}
            sx={{
              position: "absolute",
              borderRadius: "1.5rem",
              zIndex: "5",
              backgroundColor: "#32363c",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
            <CircularProgress />
          </Box>
        )}
        <Box id="player">
          <Waveform file={file} setIsLoading={setIsLoading}></Waveform>
          {trackLoaded && (
            <Slider
              className="mt-slider"
              min={0}
              max={trackDuration}
              step={0.0000000000001}
              value={trimDuration}
              onChange={handleChange}
              disableSwap></Slider>
          )}
        </Box>
      </Box>
      <Box sx={{ gridArea: "Controls", alignContent: "center" }}>
        <Stack direction="row" sx={{ alignItems: "center" }}>
          <Box sx={{ display: "flex", flexGrow: 1 }}>
            <IconButton
              className="play-pause-btn"
              type="button"
              onClick={togglePlay}
              size="large"
              aria-label="play/pause">
              {isPlaying ? (
                <PauseCircleFilled fontSize="large"></PauseCircleFilled>
              ) : (
                <PlayCircleFilled fontSize="large"></PlayCircleFilled>
              )}
            </IconButton>
            <Stack spacing={1} direction="row" sx={{ alignItems: "center", width: "10rem" }}>
              <VolumeDown />
              <Slider
                aria-label="Volume"
                valueLabelDisplay="auto"
                min={0}
                max={100}
                value={volume}
                onChange={handleVolume}
              />
              <VolumeUp />
            </Stack>
          </Box>
          <Button type="button" onClick={openDialog} variant="contained">
            Export
          </Button>
        </Stack>
        {open && <ExportDialog open={open} setOpen={setOpen} file={file} duration={trimDuration}></ExportDialog>}
      </Box>
    </>
  );
}

export default Player;
