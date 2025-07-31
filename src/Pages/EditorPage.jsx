import React, { useEffect, useState, useRef } from 'react';
import { initSocket } from '../socket';
import { Actions } from '../Actions';
import {
  useLocation,
  useNavigate,
  useParams,
  Navigate,
} from 'react-router-dom';
import 'codemirror/mode/clike/clike';
import { FiPlay, FiUsers, FiSettings, FiPenTool } from 'react-icons/fi';
import { FaCode } from 'react-icons/fa';
import { Editor } from '../components';
import toast from 'react-hot-toast';

const EditorPage = () => {
  const socketRef = useRef(null);
  const codeRef = useRef(null);

  const location = useLocation();
  const reactNavigator = useNavigate();
  const { roomId } = useParams();
  const [clients, setClients] = useState([]);
  const initializedRef = useRef(false);
  const [language, setlanguage] = useState('cpp');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const handleErrors = (e) => {
    console.log('Socket failed', e);
    toast.error('Socket failed, try again');
    reactNavigator('/');
  };

  useEffect(() => {
    if (initializedRef.current) return; // Skip initialization on re-renders
    initializedRef.current = true; // Set lock after first initialization

    const init = async () => {
      try {
        socketRef.current = await initSocket();
        socketRef.current.on('connect', () => {
          console.log('Connected to server');
        });
        socketRef.current.on('connect_error', handleErrors);
        socketRef.current.on('connect_failed', handleErrors);

        socketRef.current.emit(Actions.JOIN, {
          roomId,
          username: location.state?.username,
        });

        socketRef.current.on(
          Actions.JOINED,
          ({ clients, username, socketId }) => {
            if (username !== location.state?.username) {
              toast.success(`${username} joined the room`);
            }
            setClients(clients);
            socketRef.current.emit(Actions.CODE_SYNC, {
              socketId,
              code: codeRef.current,
            });
          }
        );

        socketRef.current.on(Actions.DISCONNECTED, ({ username, socketId }) => {
          toast.success(`${username} left the room`);
          setClients((clients) =>
            clients.filter((client) => client.socketId !== socketId)
          );
        });

        socketRef.current.on('submission-result', ({ output }) => {
          setOutput(output);
          socketRef.current.emit('output-sync', { roomId, output });
        });

        socketRef.current.on('input-sync', ({ input }) => {
          setInput(input);
        });

        socketRef.current.on('output-sync', ({ output }) => {
          setOutput(output);
        });
        socketRef.current.on('submission-error', ({ message }) => {
          console.log('Submission error:', message);
          toast.error("Couldn't run the code: Api daily limit exceeded");
        });
      } catch (error) {
        handleErrors(error);
      }
    };

    init();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current.off(Actions.JOINED);
        socketRef.current.off(Actions.DISCONNECTED);
        socketRef.current.off('submission-result');
        socketRef.current.off('input-sync');
        socketRef.current.off('output-sync');
      }
    };
  }, [roomId, location.state?.username, reactNavigator, input]);

  // Code submission
  const handleSubmission = () => {
    const code = codeRef.current;

    socketRef.current.emit('submit', {
      roomId,
      code,
      language,
      input,
    });
  };

  const handleInputChange = (event) => {
    const newInput = event.target.value;
    setInput(newInput);
    socketRef.current.emit('input-sync', { roomId, input: newInput });
  };

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success('Room ID copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy room ID');
      console.log('Failed to copy room ID', error);
    }
  };
  const leaveRoom = () => {
    socketRef.current.disconnect();
    reactNavigator('/');
  };

  if (!location.state) {
    return <Navigate to='/' />;
  }

  // console.log("in codeEditor page", socketRef.current);
  const [activeSidebarTab, setActiveSidebarTab] = useState('users'); // 'users' or 'run'
  const [activeMainContent, setActiveMainContent] = useState('code'); // 'code' or 'canvas'
  return (
    <div className='bg-gray-900 w-screen h-screen text-white flex'>
      {/* Sidebar */}
      <div className='w-12 bg-gray-800 p-4 flex flex-col items-center space-y-8'>
        <FiUsers
          className={`w-6 h-6 cursor-pointer hover:text-gray-400 ${
            activeSidebarTab === 'users' ? 'text-blue-400' : ''
          }`}
          onClick={() => setActiveSidebarTab('users')}
        />
        <FiPlay
          className={`w-6 h-6 cursor-pointer hover:text-gray-400 ${
            activeSidebarTab === 'run' ? 'text-blue-400' : ''
          }`}
          onClick={() => setActiveSidebarTab('run')}
        />
        <FiSettings className='w-6 h-6 cursor-pointer hover:text-gray-400' />
        <FaCode
          className={`w-6 h-6 cursor-pointer hover:text-gray-400 ${
            activeMainContent === 'code' ? 'text-green-400' : ' hidden'
          }`}
          onClick={() =>
            setActiveMainContent((prev) =>
              prev === 'code' ? 'canvas' : 'code'
            )
          }
        />
        <FiPenTool
          className={`w-6 h-6 cursor-pointer hover:text-gray-400 ${
            activeMainContent === 'canvas' ? 'text-green-400' : 'hidden'
          }`}
          onClick={() =>
            setActiveMainContent((prev) =>
              prev === 'code' ? 'canvas' : 'code'
            )
          }
        />
      </div>

      {/* Users List and Actions */}
      <div className='w-80 bg-gray-800 p-4 flex flex-col'>
        <h1 className='text-2xl font-bold'>CodeShare</h1>
        <p className='mt-1 text-gray-400'>A real-time code sharing platform</p>
        <div className='bg-gray-400 h-[2px] mt-2 w-full'></div>

        {/* Conditional Rendering for Users List */}
        {activeSidebarTab === 'users' ? (
          <UsersList clients={clients} />
        ) : (
          <CodeRunner
            setLanguage={setlanguage}
            input={input}
            onInputChange={handleInputChange}
            onRunCode={handleSubmission}
            output={output}
          />
        )}

        {/* Buttons Section */}
        <div className='flex flex-col mt-auto'>
          <div className='flex space-x-4'>
            <button
              onClick={copyRoomId}
              className='bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300'
            >
              Copy Room ID
            </button>
            <button
              onClick={leaveRoom}
              className='bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300'
            >
              Leave
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='flex-grow bg-gray-700 p-4'>
        <div className='bg-gray-800 h-full rounded-lg p-4'>
          {activeMainContent === 'code' ? (
            socketRef.current && (
              <Editor
                socketRef={socketRef.current}
                roomId={roomId}
                language={language}
                onCodeChange={(code) => (codeRef.current = code)}
              />
            )
          ) : (
            <Editor
              socketRef={socketRef.current}
              roomId={roomId}
              onCodeChange={(code) => (codeRef.current = code)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const UsersList = ({ clients }) => {
  return (
    <>
      <h2 className='text-lg font-bold mt-4'>Users</h2>
      <div className='mt-4 space-y-4'>
        {clients.map((client) => (
          <div key={client.socketId} className='flex items-center space-x-3'>
            <div className='relative'>
              <div className='w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-lg font-bold'>
                {client.username.charAt(0)}
              </div>
              <span className='absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-gray-800'></span>
            </div>
            <span>{client.username}</span>
          </div>
        ))}
      </div>
    </>
  );
};
const CodeRunner = ({
  setLanguage,
  input,
  onInputChange,
  onRunCode,
  output,
}) => {
  return (
    <div className='flex flex-col space-y-4'>
      <h2 className='text-lg font-bold mt-4'>Code Runner</h2>

      <div className='flex flex-col'>
        <label className='text-gray-400'>Select Language:</label>
        <select
          onChange={(e) => setLanguage(e.target.value)}
          className='bg-gray-600 text-white rounded-lg p-2'
        >
          <option value='cpp'>C++</option>
          <option value='python'>Python</option>
          <option value='javascript'>JavaScript</option>
          <option value='java'>Java</option>
        </select>
      </div>

      <div className='flex flex-col'>
        <label className='text-gray-400'>Input:</label>
        <textarea
          className='bg-gray-600 text-white rounded-lg p-2'
          rows='5'
          value={input}
          onChange={onInputChange}
        />
      </div>

      <div className='flex flex-col'>
        <label className='text-gray-400'>Output:</label>
        <textarea
          className='bg-gray-600 text-white rounded-lg p-2'
          rows='5'
          value={output}
          readOnly
        />
      </div>

      <button
        onClick={onRunCode}
        className='bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300'
      >
        Run Code
      </button>
    </div>
  );
};

export default EditorPage;
