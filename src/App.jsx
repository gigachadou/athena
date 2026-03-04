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
import Add from './pages/Add';

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
        { path: "/home", element: <ProtectedRoute><Home /></ProtectedRoute> },
        { path: "/", element: <ProtectedRoute><Home /></ProtectedRoute> },
        {path:"/profile" , element:<ProtectedRoute><Profile/></ProtectedRoute>},
        {path:"/settings" , element:<ProtectedRoute><Settings/> </ProtectedRoute>},
        {path:"/search" , element:<Search/>},
        {path:"/notification" , element:<Notification/>},
        {path:"/addversments" , element:<Add/>}

      ],
    },
    { path: "*", element: <Navigate to="/" /> },
  ]);

  return <RouterProvider router={router}></RouterProvider>
};

export default App;
