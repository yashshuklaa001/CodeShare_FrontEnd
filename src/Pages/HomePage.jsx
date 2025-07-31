import React from 'react';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
function HomePage() {
  const navigate = useNavigate();
  const [roomID, setRoomID] = useState('');
  const [username, setUsername] = useState('');
  const createRoom = (e) => {
    e.preventDefault();
    const roomID = uuidv4();
    setRoomID(roomID);
    toast.success('Created a new Room');
  };
  const joinRoom = () => {
    if (!username || !roomID) {
      toast.error('Username & RoomId is required');
    } else {
      navigate(`/editor/${roomID}`, {
        state: {
          username,
        },
      });
    }
  };
  const handleEnter = (e) => {
    if (e.code === 'Enter') {
      joinRoom();
    }
  };
  return (
    <div className='bg-gray-900 w-screen h-screen'>
      <div className='flex justify-center items-center h-screen'>
        <div className='text-center'>
          <h1 className='text-4xl text-white'>Welcome to CodeShare </h1>
          <p className='text-gray-300 mt-4'>
            CodeShare is a real-time code sharing platform
          </p>
          <div>
            <div className='flex flex-col '>
              <input
                type='text'
                placeholder='Enter room ID'
                className='bg-gray-800 text-white p-2 rounded mt-4'
                value={roomID}
                onChange={(e) => setRoomID(e.target.value)}
                onKeyUp={handleEnter}
              />
              <input
                type='text'
                placeholder='Enter your Username'
                className='bg-gray-800 text-white p-2 rounded mt-4'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyUp={handleEnter}
              />
            </div>
            <div
              onClick={joinRoom}
              className='bg-blue-500 text-white p-2 rounded mt-4 block'
            >
              Join Room
            </div>

            <p className='text-white m-2'>
              If you do not have an invite &nbsp;
              <a
                onClick={createRoom}
                className='text-blue-500 underline hover:text-blue-700 cursor-pointer'
              >
                new room
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
