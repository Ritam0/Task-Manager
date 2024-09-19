import React, { useState, useEffect } from "react";
import { auth, provider } from "../firebase-config";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleEmailPasswordSignIn = async (e) => {
    setError(null);
    e.preventDefault();
    try {
      const userCredentials = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("User signed in:", userCredentials);
      window.alert("Sign in successful");
      setEmail("");
      setPassword("");
    } catch (error) {
      setError("Invalid Credentials");
    }
  };

  const handleSigninWithGoogle = async () => {
    try {
      const data = await signInWithPopup(auth, provider);
      console.log(data);
      window.alert("Sign in with Google successful");
      localStorage.setItem("email", data.user.email);
      localStorage.setItem("photo", data.user.photoURL);
      localStorage.setItem("Name", data.user.displayName);
      localStorage.setItem("userId", data.user.uid);
      setIsLoggedIn(true);
      window.location.reload();
    } catch (error) {
      setError(error.message);
    }
  };

  const Logout = () => {
    localStorage.removeItem('email');
    localStorage.removeItem('photo');
    localStorage.removeItem('Name');
    localStorage.removeItem('userId');
    setIsLoggedIn(false);
    window.location.reload();
  };

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("email"));
  }, []);

  return (
    <div className="flex flex-col items-center justify-center max-h-[300px] max-w-[500px] bg-[#c3c4aa11]">
      {!isLoggedIn ? (
        <div className="bg-[#c3c4aa11] shadow-md rounded-lg p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center text-grreen">Login</h2>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition duration-300"
            onClick={handleSigninWithGoogle}
          >
            <div className="flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={20}
                height={20}
                viewBox="0 0 488 512"
                className="mr-3"
              >
                <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
              </svg>
              <span>Sign in with Google</span>
            </div>
          </button>
          {error && <p className="text-red-500 text-center mt-4">{error}</p>}
        </div>
      ) : (
        <div className="bg-[#c3c4aa11] shadow-md rounded-lg p-8 w-full max-w-md">
          <img src={localStorage.getItem("photo")} alt="" />
          <h2 className="text-2xl font-bold mb-6 text-center">Welcome to Task Manager! {localStorage.getItem("Name")}</h2>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600 transition duration-300"
            onClick={Logout}
          >
            <div className="flex items-center justify-center">
              <span>Logout</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default Login;
