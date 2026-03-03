import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import './App.css'
import Home from './pages/Home';
import PublicRoot from './PublicRoot';
import ProtectedRoot from './ProtectedRoot';
import ProtectedRoute from './ProtectedRoute';
import Login from './pages/Login';
import Signin from './pages/Signin';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

function App() {
  const router = createBrowserRouter([
    {
      element: <PublicRoot />,
      children: [
        { path: "/login", element: <Login /> },
        { path: "/signin", element: <Signin /> },
        { path: "/", element: <EnterPage /> }
      ],
    },
    {
      element: <ProtectedRoot />,
      children: [
<<<<<<< HEAD
        { path: "/home", element: <ProtectedRoute><Home /></ProtectedRoute> },
=======
        { path: "/", element: <ProtectedRoute><Home /></ProtectedRoute> },
        {path:"/profile" , element:<ProtectedRoute><Profile/></ProtectedRoute>},
        {path:"/settings" , element:<ProtectedRoute><Settings/> </ProtectedRoute>}
>>>>>>> home
      ],
    },
    { path: "*", element: <Navigate to="/" /> },
  ]);

  return <RouterProvider router={router}></RouterProvider>
};

export default App;
