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
import SearchProfile from './components/SearchProfile';
import PostPage from './pages/PostPage';
import FollowerPage from './pages/FollowerPage';

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
        { path: "/", element: <Home /> },
        { path: "/profile", element: <Profile /> },
        { path: "/settings", element: <Settings /> },
        { path: "/search", element: <Search /> },
        { path: "/notification", element: <Notification /> },
        { path: "/addPost", element: <AddPost /> },
        { path: "/editPost/:postId", element: <AddPost /> },
        { path: "/searchresultusers/:usersID", element: <SearchProfile /> },
        { path: "/posts/:postId", element: <PostPage /> },
        {path:'/followers/:order/:userID' , element: <FollowerPage/>},
        {path:'/search/:name' , element: <Search/>}
      ],
    },
    { path: "*", element: <Navigate to="/" /> },
  ]);

  return <RouterProvider router={router}></RouterProvider>
};

export default App;
