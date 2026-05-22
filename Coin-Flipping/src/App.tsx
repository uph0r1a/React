import { useRef, useState } from "react";
import "./App.css";

const HeadHead = "/videos/head_to_head.mp4";
const HeadTail = "/videos/head_to_tail.mp4";
const TailHead = "/videos/tail_to_head.mp4";
const TailTail = "/videos/tail_to_tail.mp4";
const sound = "/videos/coin_sound.mp3";

function App() {
  const [heads, setHeads] = useState(0);
  const [tails, setTails] = useState(0);
  const [video, setVideo] = useState(HeadHead);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const GCD = (a: number, b: number): number => {
    return b === 0 ? Math.abs(a) : GCD(b, a % b);
  };

  const flip = () => {
    const old = Math.random() < 0.5 ? 1 : 0;
    const now = Math.random() < 0.5 ? 1 : 0;

    if (now === 1) setHeads((h) => h + 1);
    else setTails((t) => t + 1);

    let newVideo = HeadHead;

    if (old === 1 && now === 1) newVideo = HeadHead;
    else if (old === 1 && now === 0) newVideo = HeadTail;
    else if (old === 0 && now === 1) newVideo = TailHead;
    else newVideo = TailTail;

    setVideo(newVideo);

    audioRef.current?.pause();
    audioRef.current?.play();

    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.load();
        videoRef.current.play().catch(() => {});
      }
    }, 0);
  };

  return (
    <div className="app">
      <h1>Coin Flip Simulator</h1>
      <p>Press flip to flip the coin</p>

      <div className="stats">
        <p>HEAD: {heads}</p>
        <p>
          {heads === 0 && tails === 0
            ? `${heads} : ${tails}`
            : `${heads / GCD(heads, tails)} : ${tails / GCD(heads, tails)}`}
        </p>
        <p>TAIL: {tails}</p>
      </div>

      <button onClick={flip}>FLIP</button>

      <video
        key={video}
        ref={videoRef}
        src={video}
        width={300}
        controls={false}
      />

      <audio ref={audioRef} src={sound} />
    </div>
  );
}

export default App;
