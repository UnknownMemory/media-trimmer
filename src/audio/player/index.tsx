import { useEffect, useState } from "react";
import Slider from "@mui/material/Slider";
import "./player.css";

import Waveform from "./waveform";
import useAudioPlayer from "../../hooks/useAudioPlayer";
import ExportDialog from "../export/dialog";
import { Box, Button, IconButton, Stack } from "@mui/material";
import {
  Pause,
  PauseCircleFilled,
  PlayArrow,
  PlayArrowRounded,
  PlayCircleFilled,
  VolumeDown,
  VolumeUp,
} from "@mui/icons-material";

interface Props {
  file: File;
}

function Player({ file }: Props) {
  const [sliderValue, setSliderValue] = useState<number[]>([0, 100]);
  const [volume, setVolume] = useState<number>(50);
  const [open, setOpen] = useState<boolean>(false);

  const {
    loadFile,
    play,
    pause,
    updateVolume,
    trackDuration,
    loaded,
    isPlaying,
    playbackTimeAtStart,
    setTrimDuration,
  } = useAudioPlayer();

  const handleChange = (_: Event, newValue: number[]) => {
    pause();
    playbackTimeAtStart.current = newValue[0];
    setSliderValue(newValue);
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
        }}>
        <Box id="player">
          <Waveform file={file}></Waveform>
          {loaded && (
            <Slider
              className="mt-slider"
              min={0}
              max={trackDuration}
              step={0.0000000000001}
              value={sliderValue}
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
        <ExportDialog open={open} setOpen={setOpen} file={file} duration={sliderValue}></ExportDialog>
      </Box>
    </>
  );
}

export default Player;
