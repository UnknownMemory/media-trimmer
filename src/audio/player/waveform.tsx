import { useEffect, useRef, type Dispatch, type SetStateAction } from "react";
import WaveSurfer from "wavesurfer.js";

interface Props {
  file: File;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
}

function PlayerWaveform({ file, setIsLoading }: Props) {
  const containerRef = useRef(null);
  const wavesurferRef = useRef<WaveSurfer>(null);

  useEffect(() => {
    if (!file || !containerRef.current) return;
    const objectUrl = URL.createObjectURL(file);

    wavesurferRef.current = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "#fff",
      url: objectUrl,
      interact: false,
      cursorWidth: 0,
    });

    wavesurferRef.current.on("ready", () => {
      setIsLoading(false);
      URL.revokeObjectURL(objectUrl);
    });

    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
      }
    };
  }, [file, setIsLoading]);

  return <div ref={containerRef}></div>;
}

export default PlayerWaveform;
