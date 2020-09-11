import React, { useState, useEffect } from 'react';
import { CountdownCircleTimer } from 'react-countdown-circle-timer';

export default function Timer({ countDown }) {
  const renderTime = ({ remainingTime }) => {
    if (remainingTime <= 0) {
      return (
        <div style={{ fontSize: '24px', color: 'white' }} className='timer'>
          Time's up!
        </div>
      );
    }

    if (remainingTime <= 10) {
      return (
        <div style={{ fontSize: '24px', textAlign: 'center', color: 'white' }}>
          <div className='text'>You got this!</div>
          <div className='value'>{remainingTime}</div>
          <div className='text'>seconds</div>
        </div>
      );
    }

    return (
      <div style={{ fontSize: '24px', textAlign: 'center', color: 'white' }}>
        <div className='text'>Remaining</div>
        <div className='value'>{remainingTime}</div>
        <div className='text'>seconds</div>
      </div>
    );
  };

  const [timerKey, setTimerKey] = useState(0);

  useEffect(() => {
    setTimerKey(timerKey + 1);
    console.log('current timer key: ' + timerKey);
  }, [timerKey, countDown]);

  return (
    <div className='timer-wrapper'>
      <CountdownCircleTimer
        key={timerKey}
        isPlaying
        duration={countDown}
        colors={[['#17a2b8'], ['#17b8a6']]}
        style={{ width: '0' }}
      >
        {renderTime}
      </CountdownCircleTimer>
    </div>
  );
}
