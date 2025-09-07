import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.tsx";
import Home from "./pages/Home.tsx";
import CreateEvent from "./pages/CreateEvent.tsx";
import EditEvent from "./pages/EditEvent.tsx";
import { useEffect } from "react";


export default function App() {
  useEffect(() => {
    const initData = (window as any).Telegram?.WebApp?.initData;
    const params = new URLSearchParams();
    params.append("initData", initData);

    fetch(import.meta.env.VITE_API_URL + "/get-token", {
      method: "POST",
      headers: {
          "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
      credentials: "include",
    }).catch(console.error);
  }, []);
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateEvent />} />
          <Route path="/edit/:id" element={<EditEvent />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
