import logo from './logo.svg';
import './App.css';
import Page from './Components/page';
import Note from './Components/Note';

function App() {
  return (
    <div className="App">
      Task Managers
      <Page/>
      <Note/>
    </div>
  );
}

export default App;
