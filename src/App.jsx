import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage, EditorPage } from './Pages';
import { Toaster } from 'react-hot-toast';
function App() {
  return (
    <>
      <div>
        <Toaster
          position='top-right'
          toastOptions={{
            success: {
              theme: {
                primary: '#4aed88',
              },
            },
          }}
        ></Toaster>
      </div>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/editor/:roomId' element={<EditorPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
