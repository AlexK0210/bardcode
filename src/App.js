import logo from './logo.svg';
import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from 'react-router-dom';
import {BarCodeGenerator} from "./Components/BarCodeGenerator";
function App() {
  return (
    <div className="App">
      <Router>
        <div>
          <nav>
            <ul>
              <li>
                <Link to="/barcode">Новая Номенклатура</Link>
              </li>
            </ul>
          </nav>

          {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
          <Switch>
            <Route path="/barcode">
              <BarCodeGenerator />
            </Route>
          </Switch>
        </div>
      </Router>
    </div>
  );
}

export default App;
