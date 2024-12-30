import { useState } from "react";
import { useTimer } from "react-timer-hook";
import styles from "./Countdown.module.scss";
import SectionHeaderIntranet from "../../../../../components/common/SectionHeaderIntranet/SectionHeaderIntranet";

const Countdown = () => {
  const [daysInput, setDaysInput] = useState(0); // Input days
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false); // To track pause state

  // Timer Hook
  const { seconds, minutes, hours, days, isRunning, pause, restart } = useTimer(
    {
      expiryTimestamp: new Date(),
      autoStart: false,
      onExpire: () => console.log("Timer expired!"),
    }
  );

  // Handle Start Button
  const handleStart = () => {
    if (isPaused && remainingTime) {
      // Restart with remaining time when resuming
      const newExpiry = new Date();
      newExpiry.setSeconds(newExpiry.getSeconds() + remainingTime);
      restart(newExpiry);
    } else if (!isRunning) {
      // Start timer from the input days
      const newExpiry = new Date();
      newExpiry.setSeconds(newExpiry.getSeconds() + daysInput * 24 * 60 * 60);
      restart(newExpiry);
    }
    setIsPaused(false); // Reset pause state
  };

  // Handle Pause Button
  const handlePause = () => {
    pause(); // Pause the timer
    const timeLeft = seconds + minutes * 60 + hours * 3600 + days * 24 * 3600; // Calculate remaining time in seconds
    setRemainingTime(timeLeft);
    setIsPaused(true); // Mark as paused
  };

  // Handle Reset Button
  const handleReset = () => {
    pause(); // Stop the timer
    setRemainingTime(null); // Clear remaining time
    setDaysInput(0); // Reset days input
    setIsPaused(false); // Reset pause state
    restart(new Date()); // Reset timer
  };

  return (
    <div className={styles.container}>
      <SectionHeaderIntranet label="CountDown" />
      <div className={styles.countdownwrapper}>
        <div className={styles.countdownsegment}>
          <span className={styles.time}>{days}</span>
          <span className={styles.label}>days</span>
        </div>
        <div className={styles.countdownsegment}>
          <span className={styles.time}>{hours}</span>
          <span className={styles.label}>hrs</span>
        </div>
        <div className={styles.countdownsegment}>
          <span className={styles.time}>{minutes}</span>
          <span className={styles.label}>mins</span>
        </div>
        <div className={styles.countdownsegment}>
          <span className={styles.time}>{seconds}</span>
          <span className={styles.label}>secs</span>
        </div>
      </div>

      {/* Controls */}
      <button onClick={handleStart} disabled={isRunning && !isPaused}>
        {isPaused ? "Resume" : "Start"}
      </button>
      <button onClick={handlePause} disabled={!isRunning}>
        Pause
      </button>
      <button onClick={handleReset}>Reset</button>
    </div>
  );
};

export default Countdown;
