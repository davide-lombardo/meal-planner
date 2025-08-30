import * as React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { KindeProvider } from "@kinde-oss/kinde-auth-react";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <KindeProvider
      clientId={import.meta.env.VITE_KINDE_CLIENT_ID}
      domain={import.meta.env.VITE_KINDE_DOMAIN}
      redirectUri={window.location.origin}
      logoutUri={window.location.origin}
      audience={import.meta.env.VITE_KINDE_AUDIENCE}
    >
      <App />
    </KindeProvider>
  </React.StrictMode>
);
