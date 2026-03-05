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
import Search from './pages/Search';
import Notification from './pages/Notification';
import AddPost from './pages/AddPost';

function App() {
  const router = createBrowserRouter([
    {
      element: <PublicRoot />,
      children: [
        { path: "/login", element: <Login /> },
        { path: "/signin", element: <Signin /> }
      ],
    },
    {
      element: <ProtectedRoot />,
      children: [
        { path: "/home", element: <Home /> },
        { path: "/", element: <ProtectedRoute><Home /></ProtectedRoute> },
        { path: "/profile", element: <ProtectedRoute><Profile /></ProtectedRoute> },
        { path: "/settings", element: <ProtectedRoute><Settings /> </ProtectedRoute> },
        { path: "/search", element: <ProtectedRoute><Search /> </ProtectedRoute> },
        { path: "/notification", element: <ProtectedRoute><Notification /></ProtectedRoute> },
        { path: "/addPost", element: <ProtectedRoute><AddPost /></ProtectedRoute> }
      ],
    },
    { path: "*", element: <Navigate to="/" /> },
  ]);

  return <RouterProvider router={router}></RouterProvider>
};

export default App;
