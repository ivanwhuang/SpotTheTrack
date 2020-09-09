import React, { useState } from 'react';

import { Row, Col, Form, ListGroup } from 'react-bootstrap';

import RangeSlider from 'react-bootstrap-range-slider';

export default function Settings({ settings }) {
  let { timer, numRounds, artists } = settings;

  return (
    <div>
      <h1 style={{ color: 'white' }}>Game Settings</h1>
      <h6 style={{ color: 'white' }}>
        Only the host of the room can change settings
      </h6>
      <div className='settings'>
        <Form style={{ color: 'white' }}>
          <fieldset disabled>
            <Form.Group as={Row} style={{ marginTop: '2rem' }}>
              <Form.Label column lg={4}>
                Time to Guess (seconds)
              </Form.Label>
              <Col lg={8}>
                <RangeSlider
                  value={timer}
                  min={30}
                  max={120}
                  step={10}
                  size='lg'
                  tooltipPlacement='top'
                  tooltip='on'
                  variant='info'
                />
              </Col>
            </Form.Group>
            <Form.Group as={Row} style={{ marginTop: '1rem' }}>
              <Form.Label column lg={4}>
                Number of Rounds
              </Form.Label>
              <Col lg={8}>
                <RangeSlider
                  value={numRounds}
                  min={5}
                  max={20}
                  step={1}
                  size='lg'
                  tooltipPlacement='top'
                  tooltip='on'
                  variant='info'
                />
              </Col>
            </Form.Group>
            <Form.Group as={Row}>
              <Form.Label column lg='4'>
                Artists used for Next Game
              </Form.Label>
              <Col lg='8'>
                <ListGroup>
                  {artists.length > 0 ? (
                    artists.map((artist) => (
                      <ListGroup.Item variant='light' key={artist}>
                        {artist}
                      </ListGroup.Item>
                    ))
                  ) : (
                    <ListGroup.Item variant='light'>
                      No artists have been chosen yet.
                    </ListGroup.Item>
                  )}
                </ListGroup>
              </Col>
            </Form.Group>
          </fieldset>
        </Form>
      </div>
    </div>
  );
}
