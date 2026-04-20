import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import './App.css'
import Home from './pages/Home';
import PublicRoot from './PublicRoot';
import ProtectedRoot from './ProtectedRoot';
import Login from './pages/Login';
import Signin from './pages/Signin';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Search from './pages/Search';
import Notification from './pages/Notification';
import AddPost from './pages/AddPost';
import Shorts from './pages/Shorts';
import Challenges from './pages/Challenges';
import Chat from './pages/Chat';
import ChatDetail from './pages/ChatDetail';
import SearchProfile from './components/SearchProfile';
import PostPage from './pages/PostPage';
import FollowerPage from './pages/FollowerPage';
import AboutUs from './pages/AboutUs';
import SplashScreen from './components/SplashScreen';
import { useState, useEffect } from 'react';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onFinished={() => setShowSplash(false)} />;
  }

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
        { path: "/", element: <Home /> },
        { path: "/profile", element: <Profile /> },
        { path: "/settings", element: <Settings /> },
        { path: "/search", element: <Search /> },
        { path: "/notification", element: <Notification /> },
        { path: "/addPost", element: <AddPost /> },
        { path: "/shorts", element: <Shorts /> },
        { path: "/challenges", element: <Challenges /> },
        { path: "/chat", element: <Chat /> },
        { path: "/chat/:chatId", element: <ChatDetail /> },
        { path: "/editPost/:postId", element: <AddPost /> },
        { path: "/searchresultusers/:usersID", element: <SearchProfile /> },
        { path: "/posts/:postId", element: <PostPage /> },
        {path:'/followers/:order/:userID' , element: <FollowerPage/>},
        {path:'/search/:name' , element: <Search/>},
        {path:"/aboutapplicationinformation" , element: <AboutUs/>}
      ],
    },
    { path: "*", element: <Navigate to="/" /> },
  ]);

  return <RouterProvider router={router}></RouterProvider>
};

export default App;
