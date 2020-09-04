import { Button } from '@material-ui/core';
import Link from 'next/link';
import axios from 'axios';
import React, { useRef } from 'react';
import AudioPlayer from 'react-h5-audio-player';
import { Form } from 'react-bootstrap';

const initialFormData = Object.freeze({
  guess: "",
});

export default function Test() {

  // player hook
  const Player = (url) => (
    <AudioPlayer
      autoPlay
      src={url}
      onPlay={e => console.log("onPlay")}
      // other props here
    />
  );

  const [fetched, setFetched] = React.useState(false);

  const [tracks, setTracks] = React.useState(null);
  const [currentTrack, setCurrentTrack] = React.useState(0);

  const [songName, setSongName] = React.useState(null);
  const [preview, setPreview] = React.useState(null);

  const [formData, updateFormData] = React.useState(initialFormData);

  const handleChange = (event) =>  {
    updateFormData({
      ...formData,
      [event.target.name]: event.target.value.trim()
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(formData);
    if (formData.guess.toLowerCase() === songName.toLowerCase()) {
      console.log("Correct!");
      console.log(currentTrack);
      setCurrentTrack(currentTrack + 1);
      
    }
  };

  // axios api call to update songName and preview
  async function fetchData() {
    try {
      const response = await axios.get('http://localhost:5000/api/spotify/initializeGameState');
      const data = JSON.parse(response.data);
      console.log(data);
      setTracks(data.tracks);
      setSongName(data.tracks[currentTrack].name);
      setPreview(data.tracks[currentTrack].preview);
      setFetched(true);
    } catch (err) {
      console.error(err);
    }
  }

  const updateToNextTrack = () => {
    setPreview(tracks[currentTrack].preview);
    setSongName(tracks[currentTrack].name);
  };

  React.useEffect( () => {
    if (!fetched) {
      fetchData();
    }

    if (currentTrack > 0) {
      updateToNextTrack();
    }
    
  }, [currentTrack]);

  return (
    <div>
      <Button color="primary" disabled>
        { !tracks ? 'Initializing Game State' : `Round ${currentTrack + 1}` }
      </Button>
      <AudioPlayer src={ preview } />

      <Link href="/"> 
        <Button color="secondary">
          { !tracks ? 'Loading song name..' : `${songName}` }
        </Button>
      </Link>

      <div>
        <form onSubmit={handleSubmit}>
          <label>
            Guess Answer:&nbsp;
            <input name="guess" onChange={handleChange} />
          </label>
          <Button color="primary" onClick={handleSubmit}>Submit</Button>
        </form>
      </div>
      
    </div>
  );
}
