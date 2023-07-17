import React, { Component } from 'react'
import { Spinner } from 'reactstrap'

export class VcSpinner extends Component {
    constructor(props) {
        super(props)
    
        this.state = {
            notifyOnCloseForm: this.props.OnCloseProcessingReq,
        }
    }

    componentDidMount() {

        if(this.timeout != null) {
            clearTimeout(this.timeout);
        }

        this.timeout = setTimeout(() => {
            this.state.notifyOnCloseForm();
        },30000)

    }

    componentWillUnmount() {
        clearTimeout(this.timeout);
    }

    onClosePopup = () => {
        this.state.notifyOnCloseForm();
    }
    
    render() {
        let appRelevantDataContextValue = this.context;
        let t = appRelevantDataContextValue.t;
        return (
            <div style={{height: "100%", width:"100%", backgroundColor:"rgba(0,0,0, 0.5)", position:"fixed", 
                         top:"0", left:"0", right:"0", bottom:"0", margin:"auto", zIndex:"9998"}}>    
                <div className="container">
                    <div className="row">
                        <div className="container col-lg-8 col-lg-offset-2
                                                col-md-6 col-md-offset-3">
                            <div className="mvAddScroll">
                                <div className="adduser-popup" class="rounded-2" style={{marginTop: "40%",backgroundColor: "rgba(255,255,255,0.2)"}}>
                                    <div style={{textAlign: "right", paddingTop:"0.5rem", paddingRight:"0.5rem"}}>
                                        <button onClick={this.onClosePopup}
                                            className="btnClearInputFieldSpinner"
                                        > 
                                            <b>X</b>
                                        </button>  
                                    </div>
                                    <div style={{padding:"1rem", opacity:"1"}}>
                                        <div>
                                            <Spinner style={{ width: '3rem', height: '3rem', color:"#F5FFFA" }} />
                                        </div>
                                        <div style={{ color:"#F5FFFA", fontWeight: "bold" }}>
                                            Loading... Please wait...
                                        </div>
                                    </div>
                                </div>
                                {/* <div class="spinner-border text-success m-20" style={{ color:"green" }} role="status">
                                    <span class="visually-hidden">Loading...</span>
                                </div> */}
                            </div>
                            {/* <div class="spinner-border text-success" role="status">
                                <span class="sr-only">Loading...</span>
                            </div> */}
                        </div> 
                    </div>
                </div>
            </div>
        )
    }
}

export default VcSpinner
