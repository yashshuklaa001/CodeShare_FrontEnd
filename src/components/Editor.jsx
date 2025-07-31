import React, { useEffect, useRef } from 'react';
import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/mode/clike/clike';
import 'codemirror/mode/python/python';
import { Actions } from '../Actions';
const Editor = ({ socketRef, roomId, onCodeChange, language }) => {

  const language_id = {
    javascript: 'javascript',
    cpp: 'text/x-c++src',
    python: 'python',
    java: 'text/x-java',
  };
  const editorRef = useRef(null);
  useEffect(() => {
    const editor = CodeMirror.fromTextArea(
      document.getElementById('realTimeEditor'),
      {
        lineNumbers: true,
        mode: language_id[language],
        theme: 'dracula',
        autoCloseTags: true,
        autoCloseBrackets: true,
      }
    );
    editor.setSize('100%', '100%');
   
    editorRef.current = editor;
    // Code change event
    editorRef.current.on('change', (instance, change) => {
      const { origin } = change;
      const code = instance.getValue();
      onCodeChange(code);
      if (origin !== 'setValue') {
        socketRef.emit(Actions.CODE_CHANGE, {
          roomId,
          code,
        });
      }
    });
    // listen for code change
    if (socketRef) {
      socketRef.on(Actions.CODE_CHANGE, ({ code }) => {
        if (code !== null) {
          editorRef.current.setValue(code);
        }
      });
    }

    return () => {
      socketRef.off(Actions.CODE_CHANGE);
      editor.toTextArea();
    };
  }, [socketRef,language]);
  return (
    <textarea
      id='realTimeEditor'
      className='w-full h-full bg-gray-800 text-white p-4 text-sm outline-none'
      placeholder='Write your code here...'
    ></textarea>
  );
};

export default Editor;
