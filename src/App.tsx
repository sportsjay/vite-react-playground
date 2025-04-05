import { Provider } from "react-redux";

import { store } from "./data";
import { Reminder } from "./demo/Reminder";

const App = () => {
  return (
    <Provider store={store}>
      {/* <Redaction /> */}
      <Reminder />
    </Provider>
  );
};

export default App;
