import "@/styles/globals.css"; // Your Tailwind CSS import
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar"; // Adjust the import path based on your project structure
import { SessionProvider } from "next-auth/react"; // Import SessionProvider from next-auth/react

export default function App({ Component, pageProps }) {
  return (
    <SessionProvider session={pageProps.session}>
      {/* Navbar Component */}
      <Navbar />

      {/* Page Content */}
      <Component {...pageProps} />

      {/* Toast Notifications */}
      <Toaster position="top-center" reverseOrder={false} />
    </SessionProvider>
  );
}
