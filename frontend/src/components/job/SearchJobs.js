import { Component, Fragment } from "react";
import ls from "local-storage";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

class SearchJobs extends Component {
    constructor() {
        super();
        this.state = {
            key: "",
            orgJobs: [],
            showJobs: [],
            filters: {
                type: "Any",
                salaryMin: -Infinity,
                salaryMax: +Infinity,
                duration: 7,
                sortby: "",
                reverse: false,
            },
        };
    }

    applyFilters = (filters) => {
        if (filters.salaryMax === "") {
            filters.salaryMax = Infinity;
        }
        this.setState({ filters });
        let jobList = this.state.orgJobs;
        if (filters.type !== "Any") {
            jobList = jobList.filter((item) => item.type === filters.type);
        }
        if (filters.salaryMin > -Infinity) {
            jobList = jobList.filter((item) => item.salary >= filters.salaryMin);
        }
        if (filters.salaryMax < +Infinity) {
            jobList = jobList.filter((item) => item.salary <= filters.salaryMax);
        }
        jobList = jobList.filter((item) => item.duration < filters.duration);
        if (filters.sortBy !== "") {
            jobList.sort(
                (a, b) => (filters.reverse ? -1 : 1) * (a[filters.sortBy] - b[filters.sortBy])
            );
        }
        this.setState({ showJobs: jobList });
    };

    createApplyButton = (job, index) => {
        if (job.applied === "yes") {
            return <button>Applied</button>;
        } else if (job.appliedCnt >= job.maxApplicant) {
            return <button>Full</button>;
        } else {
            return <button onClick={this.applyJob(index)}>Apply</button>;
        }
    };

    sortJobsfunc = (key, reverse = false) => (e) => {
        e.preventDefault();
        const filters = { ...this.state.filters, sortBy: key, reverse };
        this.applyFilters(filters);
    };

    configureSection = () => {
        const sortBtn = (msg, func) => (
            <button style={{ margin: "2px" }} className="btn btn-sm btn-info" onClick={func}>
                {msg}
            </button>
        );
        const onChange = (e) => {
            e.preventDefault();
            const filters = { ...this.state.filters, [e.target.id]: e.target.value };
            this.applyFilters(filters);
        };
        return (
            <div style={{ margin: "10px" }}>
                <div>
                    {sortBtn("Sort by Salary", this.sortJobsfunc("salary"))}
                    {sortBtn("Sort by Salary(rev)", this.sortJobsfunc("salary", true))}
                    {sortBtn("Sort by Rating", this.sortJobsfunc("rating"))}
                    {sortBtn("Sort by Rating(rev)", this.sortJobsfunc("rating", true))}
                    {sortBtn("Sort by Duration", this.sortJobsfunc("duration"))}
                    {sortBtn("Sort by Duration(rev)", this.sortJobsfunc("duration", true))}
                    <br />
                    <div className="dropdown">
                        Type:
                        <select id="type" onChange={onChange}>
                            <option className="dropdown-item" value="Any">
                                Any
                            </option>
                            <option className="dropdown-item" value="Work From Home">
                                Work From Home
                            </option>
                            <option className="dropdown-item" value="Part Time">
                                Part Time
                            </option>
                            <option className="dropdown-item" value="Full Time">
                                Full Time
                            </option>
                        </select>
                    </div>
                    <label>Salary min:</label>
                    <input id="salaryMin" type="number" min="0" step="1" onChange={onChange} />
                    <label>Salary max:</label>
                    <input id="salaryMax" type="number" min="0" step="1" onChange={onChange} />
                    {/* <input
                        id="duration"
                        type="number"
                        min="1"
                        max="7"
                        step="1"
                        onChange={onChange}
                    /> */}
                    <div className="dropdown">
                        <label>Duration less than:</label>
                        <select
                            itemType="number"
                            defaultValue="7"
                            id="duration"
                            onChange={onChange}
                        >
                            <option className="dropdown-item" value="1">
                                1
                            </option>
                            <option className="dropdown-item" value="2">
                                2
                            </option>
                            <option className="dropdown-item" value="3">
                                3
                            </option>
                            <option className="dropdown-item" value="4">
                                4
                            </option>
                            <option className="dropdown-item" value="5">
                                5
                            </option>
                            <option className="dropdown-item" value="6">
                                6
                            </option>
                            <option className="dropdown-item" value="7">
                                7
                            </option>
                        </select>
                    </div>
                </div>
            </div>
        );
    };

    componentDidMount() {
        this.updateJobs();
    }

    updateJobs = () => {
        axios
            .get("/job/search", {
                params: { key: this.state.key },
            })
            .then((res) => {
                let jobList = res.data;
                axios
                    .get("/application", { params: { email: ls.get("email") } })
                    .then((res) => {
                        const myAppList = res.data;
                        for (const job of jobList) {
                            let tmp = myAppList.filter((app) => app.jobid === job._id);
                            if (tmp.length > 0) job.applied = "yes";
                            else job.applied = "no";
                        }
                        this.setState({ orgJobs: jobList });
                        this.setState({ showJobs: jobList });
                    })
                    .catch((err) => {
                        console.log(err);
                        alert("error");
                    });
            })
            .catch((res) => {
                alert(res.response.data.error);
            });
    };

    applyJob = (index) => (e) => {
        e.preventDefault();
        let url = new URLSearchParams({
            jobid: this.state.showJobs[index]._id,
        });
        url = "/jobapply/?" + url.toString();
        window.location = url;
    };

    render() {
        return (
            <div className="container">
                <h1>Search Jobs</h1>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        this.updateJobs();
                    }}
                >
                    <div className="form-group">
                        <label>search by title: </label>
                        <input
                            id="key"
                            type="text"
                            className="form-control"
                            onChange={(e) => {
                                e.preventDefault();
                                this.setState({ key: e.target.value });
                            }}
                        />
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                this.updateJobs();
                            }}
                        >
                            Go
                        </button>
                    </div>
                </form>

                {this.configureSection()}

                <div className="container">
                    <table className="table table-hover responsive bordered">
                        <thead className="thead-dark">
                            <tr key="head">
                                <th scope="col">Title</th>
                                <th scope="col">Recruiter</th>
                                <th scope="col">Rating</th>
                                <th scope="col">Salary</th>
                                <th scope="col">Duration</th>
                                <th scope="col">Deadline</th>
                                <th scope="col"> </th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.showJobs.map((item, index) => {
                                return (
                                    <tr key={index}>
                                        <td onClick={this.applyJob(index)}>{item.title}</td>
                                        <td onClick={this.applyJob(index)}>{item.recruiterName}</td>
                                        <td onClick={this.applyJob(index)}>{item.rating}</td>
                                        <td onClick={this.applyJob(index)}>{item.salary}</td>
                                        <td onClick={this.applyJob(index)}>{item.duration}</td>
                                        <td onClick={this.applyJob(index)}>
                                            {new Date(item.deadline).toLocaleString()}
                                        </td>
                                        <td onClick={(e) => console.log(index)}>
                                            {this.createApplyButton(item, index)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}

export default SearchJobs;
