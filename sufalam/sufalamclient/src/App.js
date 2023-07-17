import './App.css';
// import { AppRelevantDataContext } from './AppContext';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import React, {Component} from 'react';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import VcSpinner from './Component/JS/VcSpinner';
import VcProduct from './Component/JS/VcProduct';

class App extends Component {

  constructor(props){
    super(props);

    this.lastRequestURL = '';

    this.state = {
        // isReqProcessing: false,
    }    
  }

  componentDidMount () {
  }

  static renderLoadingPage = () => {
    return (
      <div> 
        <div className="container-fluid LoadingPage">
          <div className="row">
            <div className = "container col-lg-8">
              <div className="col-xs-12 col-sm-12 col-md-12  LoadingPageContent">
                <div className="outerRoundedDivWithShadow col-xs-12 col-sm-6 col-md-8 offset-md-2 offset-xs-3 offset-sm-3">
                  <div>
                    <span className="pageMsgFont" 
                    >
                      Loading Page. Please Wait... 
                    </span>
                  </div>                  
                </div>
              </div>
            </div>     
          </div>
        </div>
      </div>
    );
  }

  render() {
    
    // This will refresh whole page explicitly.
    if(this.state.canRefreshPage == true) {
      window['location'].reload();
    }
    
    return (

        <div className="App">
        

          <div>
            { this.state.isReqProcessing ?
              <VcSpinner
                OnCloseProcessingReq = {this.OnCloseProcessingReq}
              />                  
              : null
            }
          </div>
          <DndProvider backend={HTML5Backend}>
            <Router>
                <Routes>
                    <Route path = "/" 
                        // element={<VcProduct key = "/productAction/productDetails" />}
                        element={<VcProduct/>}
                    />
                </Routes>
              </Router> 
          </DndProvider>      
        </div>
      // </AppRelevantDataContext.Provider>
    )
  }
} 
export default App;