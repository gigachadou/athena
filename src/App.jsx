import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import './App.css'
import Home from './pages/Home';
import PublicRoot from './PublicRoot';
import ProtectedRoot from './ProtectedRoot';
import ProtectedRoute from './ProtectedRoute';
import Login from './pages/Login';
import Signin from './pages/Signin';
import EnterPage from './pages/EnterPage';
import AddPost from './pages/AddPost';

function App() {
  const router = createBrowserRouter([
    {
      element: <PublicRoot />,
      children: [
        { path: "/login", element: <Login /> },
        { path: "/signin", element: <Signin /> },
        { path: "/enter", element: <EnterPage /> }
      ],
    },
    {
      element: <ProtectedRoot />,
      children: [
        { path: "/", element: <ProtectedRoute><Home /></ProtectedRoute> },
        { path: "/addPost", element: <ProtectedRoute><AddPost /></ProtectedRoute> }
      ],
    },
    { path: "*", element: <Navigate to="/" /> },
  ]);

  return <RouterProvider router={router}></RouterProvider>
};

export default App;
