import React, { Component, Fragment } from "react";
import axios from "axios";
import ls from "local-storage";
import "bootstrap/dist/css/bootstrap.min.css";
import BasicProfile from "./BasicProfile";
import ExtApplicantProfile from "./ExtApplicantProfile";
import ExtRecruiterProfile from "./ExtRecruiterProfile";

class Register extends Component {
    constructor() {
        super();
        this.state = {
            name: "",
            email: "",
            password: "",
            isRecruiter: false,
            // for recruiter
            contact: "",
            bio: "",
            ////////////////
            // for applicant
            ed: [],
            skills: [],
            applyCnt: 0,
        };
    }

    onChange = (e) => {
        this.setState({ [e.target.id]: e.target.value });
    };

    chOnChange = (key, value) => {
        this.setState({ [key]: value });
    };

    onSubmit = (e) => {
        e.preventDefault();
        const newUserData = this.state;
        axios
            .post("/user/register", newUserData)
            .then((res) => {
                ls.set("logged-in", "true");
                ls.set("email", res.data.user.email);
                ls.set("isRecruiter", res.data.user.isRecruiter);
                window.location = "/";
            })
            .catch((res) => {
                console.log(res);
                alert("Error:" + toString(res[Object.keys(res)[0]]));
            });
    };

    handleArrayChange = (arr, chIndex, chItem) => {
        this.setState({
            [arr]: this.state[arr].map((item, idx) => {
                return idx === chIndex ? chItem : item;
            }),
        });
    };
    handleArrayAdd = (arr, item) => {
        this.setState({
            [arr]: [...this.state[arr], item],
        });
    };

    handleArrayDelete = (arr, index) => {
        this.setState({
            [arr]: this.state[arr].filter((item, idx) => index !== idx),
        });
    };

    render() {
        return (
            <div className="container">
                <h1>Register</h1>
                <form onSubmit={this.onSubmit}>
                    <BasicProfile parOnChange={this.chOnChange} user={this.state} />

                    <div className="form-group">
                        <label>User Type : </label>
                        <div className="dropdown">
                            <select id="isRecruiter" onChange={this.onChange}>
                                <option className="dropdown-item" value="false">
                                    Applicant
                                </option>
                                <option className="dropdown-item" value="true">
                                    Recruiter
                                </option>
                            </select>
                        </div>
                    </div>
                    <Fragment>
                        {this.state.isRecruiter === "true" ? (
                            <ExtRecruiterProfile user={this.state} parOnChange={this.chOnChange} />
                        ) : (
                            <ExtApplicantProfile
                                user={this.state}
                                handleArrayAdd={this.handleArrayAdd}
                                handleArrayDelete={this.handleArrayDelete}
                                handleArrayChange={this.handleArrayChange}
                            />
                        )}
                    </Fragment>
                    <button type="submit" className="btn btn-primary">
                        Submit
                    </button>
                </form>
            </div>
        );
    }
}

export default Register;
