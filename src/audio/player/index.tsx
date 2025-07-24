import { useEffect, useState } from "react";
import { Input, ALL_FORMATS, BlobSource } from "mediabunny";

import Waveform from "./waveform";
import "./player.css";

function Player({ file }: { file: File }) {
  const [track, setTrack] = useState<File>();
  useEffect(() => {
    const input = new Input({
      formats: ALL_FORMATS,
      source: new BlobSource(file),
    });

    input.getPrimaryAudioTrack().then((track) => {
      if (track) {
        setTrack(file);
      }
    });
  }, [file]);

  return (
    <>
      <div id="player">
        {track && <Waveform file={track}></Waveform>}
        {/* <div className="double-slider">
          <input type="range" className="min" min="0" max="100" value="0" step="0" />
          <input type="range" className="max" min="0" max="100" value="20" step="0" />
        </div> */}
      </div>
    </>
  );
}

export default Player;
