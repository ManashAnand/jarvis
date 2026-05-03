import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { BaseProvider } from "./provider/BaseProvider";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <BrowserRouter>
    <BaseProvider>
      <App />
    </BaseProvider>,
  </BrowserRouter>
);
