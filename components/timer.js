import React, { useState } from 'react';
import { CountdownCircleTimer } from 'react-countdown-circle-timer';

export default function Timer({ duration }) {
  const renderTime = ({ remainingTime }) => {
    if (remainingTime === 0) {
      return (
        <div style={{ fontSize: '24px', color: 'white' }} className='timer'>
          Time's up!
        </div>
      );
    }

    if (remainingTime <= 10) {
      <div style={{ fontSize: '24px', textAlign: 'center', color: 'white' }}>
        <div className='text'>You got this!</div>
        <div className='value'>{remainingTime}</div>
        <div className='text'>seconds</div>
      </div>;
    }

    return (
      <div style={{ fontSize: '24px', textAlign: 'center', color: 'white' }}>
        <div className='text'>Remaining</div>
        <div className='value'>{remainingTime}</div>
        <div className='text'>seconds</div>
      </div>
    );
  };

  return (
    <div className='timer-wrapper'>
      <CountdownCircleTimer
        isPlaying
        duration={duration}
        colors={[['#17a2b8'], ['#17b8a6']]}
        style={{ width: '0' }}
      >
        {renderTime}
      </CountdownCircleTimer>
    </div>
  );
}
