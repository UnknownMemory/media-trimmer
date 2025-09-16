import { ALL_FORMATS, AudioBufferSink, BlobSource, Input, InputAudioTrack, type WrappedAudioBuffer } from "mediabunny";
import { useCallback, useRef, useState } from "react";

const useAudioPlayer = () => {
  const [track, setTrack] = useState<InputAudioTrack>();
  const [trackDuration, setTrackDuration] = useState<number>(0);
  const [trimDuration, setTrimDuration] = useState<number[]>([0, 0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackTime, setPlaybackTime] = useState<number>(0);
  const [trackLoaded, setTrackLoaded] = useState<boolean>(false);
  const audioInput = useRef<BlobSource | null>(null);

  const audioContext = useRef<AudioContext | null>(null);
  const gainNode = useRef<GainNode | null>(null);
  const audioSink = useRef<AudioBufferSink | null>(null);
  const audioContextStartTime = useRef<number>(0);
  const playbackTimeAtStart = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(false);
  const audioBufferIterator = useRef<AsyncGenerator<WrappedAudioBuffer, void, unknown>>(null);
  const queuedAudioNodes = useRef<Set<AudioBufferSourceNode>>(new Set());

  const getPlaybackTime = () => {
    if (isPlayingRef.current && audioContext.current) {
      return audioContext.current.currentTime - audioContextStartTime.current + playbackTimeAtStart.current;
    } else {
      return playbackTimeAtStart.current;
    }
  };

  const play = async () => {
    if (!audioContext.current) {
      return;
    }

    if (audioContext.current.state === "suspended") {
      await audioContext.current.resume();
    }

    if (getPlaybackTime() >= trimDuration[1]) {
      playbackTimeAtStart.current = trimDuration[0];
    }

    audioContextStartTime.current = audioContext.current.currentTime;
    isPlayingRef.current = true;
    setIsPlaying(true);

    if (audioSink.current) {
      audioBufferIterator.current?.return();
      audioBufferIterator.current = audioSink.current?.buffers(getPlaybackTime());

      await runAudioIterator();
    }
  };

  const interrupt = (event: "pause" | "stop") => {
    if (event == "stop") {
      playbackTimeAtStart.current = trimDuration[0];
      setPlaybackTime(trimDuration[0]);
    } else if (event == "pause") {
      playbackTimeAtStart.current = getPlaybackTime();
    }
    isPlayingRef.current = false;
    setIsPlaying(false);

    audioBufferIterator.current?.return();
    audioBufferIterator.current = null;

    for (const node of queuedAudioNodes.current) {
      node.stop();
    }

    queuedAudioNodes.current.clear();
  };

  const runAudioIterator = async () => {
    if (!audioSink.current) {
      return;
    }

    // To play back audio, we loop over all audio chunks (typically very short) of the file and play them at the correct
    // timestamp. The result is a continuous, uninterrupted audio signal.

    for await (const { buffer, timestamp } of audioBufferIterator.current!) {
      const bufferEnd = timestamp + buffer.duration;
      const node = audioContext.current!.createBufferSource();
      node.buffer = buffer;
      node.connect(gainNode.current!);

      setPlaybackTime(timestamp);
      const startTimestamp = audioContextStartTime.current! + timestamp - playbackTimeAtStart.current;

      // Two cases: Either, the audio starts in the future or in the past
      if (startTimestamp >= audioContext.current!.currentTime) {
        // If the audio starts in the future, easy, we just schedule it
        node.start(startTimestamp);
      } else {
        // If it starts in the past, then let's only play the audible section that remains from here on out
        node.start(audioContext.current!.currentTime, audioContext.current!.currentTime - startTimestamp);
      }

      queuedAudioNodes.current.add(node);
      node.onended = () => {
        queuedAudioNodes.current.delete(node);
      };

      if (bufferEnd >= trimDuration[1]) {
        if (isPlayingRef.current) {
          playbackTimeAtStart.current = trimDuration[1];
          interrupt("pause");
        }
      }

      if (timestamp - getPlaybackTime() >= 1) {
        await new Promise<void>((resolve) => {
          const id = setInterval(() => {
            if (timestamp - getPlaybackTime() < 1) {
              clearInterval(id);
              resolve();
            }
          }, 100);
        });
      }
    }
  };

  const loadFile = useCallback(async (file: File) => {
    try {
      audioBufferIterator.current?.return();
      setTrackLoaded(false);

      const input = new Input({
        formats: ALL_FORMATS,
        source: new BlobSource(file),
      });
      audioInput.current = new BlobSource(file);

      const audioTrack = await input.getPrimaryAudioTrack();
      if (!audioTrack) return;

      const duration = await audioTrack.computeDuration();

      setTrack(audioTrack);
      setTrackDuration(duration);
      setTrimDuration([0, duration]);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Ctx: typeof window.AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioContext.current = new Ctx({ sampleRate: audioTrack.sampleRate });

      gainNode.current = audioContext.current.createGain();
      gainNode.current.connect(audioContext.current.destination);
      updateVolume(50);

      audioSink.current = audioTrack && new AudioBufferSink(audioTrack);

      return setTrackLoaded(true);
    } catch (error) {
      console.error("Failed to initialize audio player:", error);
    }
  }, []);

  const updateVolume = (volume: number) => {
    if (gainNode.current) {
      const vol = volume / 100;
      gainNode.current.gain.value = vol ** 2;
    }
  };

  return {
    loadFile,
    play,
    interrupt,
    setTrimDuration,
    updateVolume,
    track,
    trackDuration,
    trimDuration,
    playbackTime,
    isPlaying,
    trackLoaded,
    playbackTimeAtStart,
  };
};

export default useAudioPlayer;
