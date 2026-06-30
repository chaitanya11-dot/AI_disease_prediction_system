import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ChatbotWidget from "../chatbot/ChatbotWidget";

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-warmgray-50 dark:bg-clinical-950 text-warmgray-900 dark:text-clinical-50">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ChatbotWidget />
    </div>
  );
}
