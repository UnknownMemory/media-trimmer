import { useCallback, useEffect, useRef } from "react";

interface Props {
  trackDuration: number;
  playbackTime: number;
  isPlaying: boolean;
}

export const Timebar = ({ trackDuration, playbackTime, isPlaying }: Props) => {
  const timeBarRef = useRef<HTMLDivElement | null>(null);
  const reqAnimRef = useRef<number | null>(null);
  const scaling = 100 / trackDuration;

  const animate = useCallback(() => {
    if (timeBarRef.current) {
      timeBarRef.current.style.left = `${playbackTime * scaling}%`;
      reqAnimRef.current = requestAnimationFrame(animate);
    }
  }, [playbackTime, scaling]);

  useEffect(() => {
    if (isPlaying && reqAnimRef.current === null) {
      reqAnimRef.current = requestAnimationFrame(animate);
    } else if (timeBarRef.current && !isPlaying) {
      const position = playbackTime * scaling;
      timeBarRef.current.style.left = `${position}%`;
    }

    return () => {
      if (reqAnimRef.current !== null) {
        cancelAnimationFrame(reqAnimRef.current);
        reqAnimRef.current = null;
      }
    };
  }, [animate, isPlaying, playbackTime, scaling]);

  return <div className="timebar" ref={timeBarRef}></div>;
};
