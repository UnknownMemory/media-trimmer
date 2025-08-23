import { useEffect, useState } from "react";
import Slider from "@mui/material/Slider";
import "./player.css";

import Waveform from "./waveform";
import useAudioPlayer from "../../hooks/useAudioPlayer";

interface Props {
  file: File;
}

function Player({ file }: Props) {
  const [sliderValue, setSliderValue] = useState<number[]>([0, 100]);

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
            step={0.001}
            value={sliderValue}
            onChange={handleChange}
            disableSwap></Slider>
        )}
      </div>
      {loaded && <button onClick={togglePlay}>{isPlaying ? "Pause" : "Play"}</button>}
    </>
  );
}

export default Player;
