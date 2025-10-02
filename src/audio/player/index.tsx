import { useEffect, useState } from "react";
import { Box, Button, CircularProgress, IconButton, Stack } from "@mui/material";
import { PauseCircleFilled, PlayCircleFilled, StopCircle, VolumeDown, VolumeUp } from "@mui/icons-material";
import Slider from "@mui/material/Slider";

import useAudioPlayer from "../../hooks/useAudioPlayer";

import Waveform from "./waveform";
import ExportDialog from "../export/dialog";
import { Timebar } from "./timebar.tsx";
import "./player.css";

interface Props {
  file: File;
}

const formatTime = (seconds: number) => {
  seconds = Math.round(seconds * 1000) / 1000;

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const millisecs = Math.floor((1000 * seconds) % 1000)
    .toString()
    .padStart(3, "0");

  let result: string;
  if (hours > 0) {
    result =
      `${hours}:${minutes.toString().padStart(2, "0")}` +
      `:${remainingSeconds.toString().padStart(2, "0")}.${millisecs}`;
  } else {
    result = `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}.${millisecs}`;
  }

  return result;
};

function Player({ file }: Props) {
  const [volume, setVolume] = useState<number>(50);
  const [open, setOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const {
    loadFile,
    play,
    interrupt,
    updateVolume,
    trackDuration,
    trackLoaded,
    trimDuration,
    isPlaying,
    playbackTime,
    setPlaybackTime,
    playbackTimeAtStart,
    setTrimDuration,
  } = useAudioPlayer();

  const handleChange = async (_: Event, newValue: number[]) => {
    interrupt("pause");
    playbackTimeAtStart.current = newValue[0];
    setPlaybackTime(newValue[0]);
    setTrimDuration(newValue);
  };

  const togglePlay = async () => {
    if (!isPlaying) {
      await play();
    } else {
      interrupt("pause");
    }
  };

  const openDialog = () => {
    if (!open) {
      if (isPlaying) interrupt("pause");
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
          <Timebar trackDuration={trackDuration} playbackTime={playbackTime} isPlaying={isPlaying}></Timebar>
          <Waveform file={file} setIsLoading={setIsLoading}></Waveform>
          {trackLoaded && (
            <Slider
              className="mt-slider"
              min={0}
              max={trackDuration}
              step={0.0000000000001}
              value={trimDuration}
              onChange={handleChange}
              valueLabelDisplay="auto"
              valueLabelFormat={formatTime}
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
            <IconButton
              className="play-pause-btn"
              type="button"
              onClick={() => interrupt("stop")}
              size="large"
              aria-label="play/pause">
              <StopCircle fontSize="large"></StopCircle>
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
