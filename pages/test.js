import { Button } from '@material-ui/core';
import Link from 'next/link';
import axios from 'axios';
import React from 'react';

export default function Test() {

  const [songName, setSongName] = React.useState(null);

  React.useEffect( () => {
    async function fetchData() {
      try {
        const response = await axios.get('http://localhost:5000/api/spotify/gettrack');
        const data = JSON.parse(response.data);
        console.log(data);
        setSongName(data.name);
      } catch (err) {
        console.error(err);
      }
    } 
    fetchData();
  }, []);

  return (
    <div>
      <Link href="/"> 
        <Button color="primary">
          { !songName ? 'Loading song name..' : `${songName}` }
        </Button>
      </Link>
    </div>
  );
}
