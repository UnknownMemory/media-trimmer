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

const waveData = (buffer: AudioBuffer, width: number) => {
  const channelData = buffer.getChannelData(0);
  const step = Math.ceil(channelData.length / width);
  return { channelData, step };
};

const render = async (canvas: HTMLCanvasElement, file: File) => {
  const audioContext = new AudioContext();
  const audioBuffer = await audioContext.decodeAudioData(await file.arrayBuffer());

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  const width = canvas.width;
  const height = canvas.height;
  const { channelData, step } = waveData(audioBuffer, width);
  const amp = height / 2;

  ctx.translate(0.5, 0.5);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1;
  ctx.beginPath();

  for (let i = 0; i < width; i++) {
    let min = 1.0;
    let max = -1.0;

    for (let j = 0; j < step; j++) {
      const total = channelData[i * step + j];
      if (total < min) min = total;
      if (total > max) max = total;
      if (isNaN(total)) break;
    }

    const x = i;
    const yMin = (1 + min) * amp;
    const yMax = (1 + max) * amp;

    if (i === 0) {
      ctx.moveTo(x, yMin);
    } else {
      ctx.lineTo(x, yMin);
    }

    ctx.lineTo(x, yMax);
  }
  ctx.translate(0.5, 0.5); // Helps with crisp lines
  ctx.imageSmoothingEnabled = true;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, height / 2);
  ctx.lineTo(width, height / 2);
  ctx.stroke();
};

export default Waveform;
