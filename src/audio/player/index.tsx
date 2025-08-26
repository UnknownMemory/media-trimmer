import { useEffect, useState } from "react";
import Slider from "@mui/material/Slider";
import "./player.css";

import Waveform from "./waveform";
import useAudioPlayer from "../../hooks/useAudioPlayer";
import ExportDialog from "../export/dialog";

interface Props {
  file: File;
}

function Player({ file }: Props) {
  const [sliderValue, setSliderValue] = useState<number[]>([0, 100]);
  const [open, setOpen] = useState<boolean>(false);

  const { loadFile, play, pause, trackDuration, loaded, isPlaying, playbackTimeAtStart, setTrimDuration } =
    useAudioPlayer();

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

  useEffect(() => {
    loadFile(file);
  }, [file, loadFile]);

  return (
    <>
      <div id="player">
        <Waveform file={file}></Waveform>
        {loaded && (
          <Slider
            className="mt-slider"
            max={trackDuration}
            step={0.0000000000001}
            value={sliderValue}
            onChange={handleChange}
            disableSwap></Slider>
        )}
      </div>
      <div>
        <button onClick={togglePlay}>{isPlaying ? "Pause" : "Play"}</button>
        <button onClick={openDialog}>Export</button>
        <ExportDialog open={open} setOpen={setOpen} file={file} duration={sliderValue}></ExportDialog>
      </div>
    </>
  );
}

export default Player;
