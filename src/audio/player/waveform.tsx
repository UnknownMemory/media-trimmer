import { useEffect, useRef } from "react";

function Waveform({ file }: { file: File }) {
  const canvasref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasref.current || !file) return;

    canvasref.current.width = canvasref.current.offsetWidth;
    canvasref.current.height = canvasref.current.offsetHeight;

    render(canvasref.current, file);
  }, [file]);

  return (
    <>
      <canvas id="waveform" ref={canvasref}></canvas>
    </>
  );
}

const render = async (canvas: HTMLCanvasElement, file: File) => {
  const audioContext = new AudioContext();
  const audioBuffer = await audioContext.decodeAudioData(await file.arrayBuffer());

  const canvasCtx = canvas.getContext("2d");
  canvasCtx.translate(0.5, 0.5);
  const WIDTH = canvas.width;
  const HEIGHT = canvas.height;

  canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
  const draw = () => {
    const channelData = audioBuffer.getChannelData(0);
    const step = Math.ceil(channelData.length / WIDTH);
    const amp = HEIGHT / 2;

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = "#4285f4";
    canvasCtx.beginPath();

    for (let i = 0; i < WIDTH; i++) {
      let min = 1.0;
      let max = -1.0;

      for (let j = 0; j < step; j++) {
        const datum = channelData[i * step + j];
        if (datum < min) min = datum;
        if (datum > max) max = datum;
        if (isNaN(datum)) break;
      }

      const x = i;
      const yMin = (1 + min) * amp;
      const yMax = (1 + max) * amp;

      if (i === 0) {
        canvasCtx.moveTo(x, yMin);
      } else {
        canvasCtx.lineTo(x, yMin);
      }

      canvasCtx.lineTo(x, yMax);
    }
    canvasCtx.translate(0.5, 0.5); // Helps with crisp lines
    canvasCtx.imageSmoothingEnabled = true;
    canvasCtx.stroke();

    canvasCtx.strokeStyle = "#666";
    canvasCtx.beginPath();
    canvasCtx.moveTo(0, HEIGHT / 2);
    canvasCtx.lineTo(WIDTH, HEIGHT / 2);
    canvasCtx.stroke();
  };

  draw();
};

export default Waveform;
