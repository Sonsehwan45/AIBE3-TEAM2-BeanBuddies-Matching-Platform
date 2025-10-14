import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./router";
import { useState } from "react";
import Header from "./components/feature/Header";
import Footer from "./components/feature/Footer";
import { AuthProvider } from "@/context/AuthContext";

function App() {
  const [userType, setUserType] = useState<"client" | "freelancer">("client");

  return (
    <AuthProvider>
      <BrowserRouter basename={__BASE_PATH__}>
        <div className="min-h-screen flex flex-col bg-white">
          <Header userType={userType} onUserTypeChange={setUserType} />
          <main className="flex-1">
            <AppRoutes userType={userType} setUserType={setUserType} />
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
