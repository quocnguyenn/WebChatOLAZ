import React from "react";
import "../components/components/SignUp.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckSquare, faCoffee } from '@fortawesome/fontawesome-free-solid';
import Footer from '../components/components/Footer';
import axios from "axios";
import { BrowserRouter as Redirect } from 'react-router-dom';
// npm install --save sweetalert2
import Swal from 'sweetalert2/dist/sweetalert2.js'
// npm install node-sass
import 'sweetalert2/src/sweetalert2.scss'
import { Tabs, Tab } from "react-bootstrap";

var ma_otp = "";
const IP = require('../config/config')
var ipConfigg = IP.PUBLIC_IP;

const emailRegex = RegExp(
    /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
);

const sdtRegex = RegExp(
    /^(0)[1-9]{1}[0-9]{8}$/
);

const formValid = ({ formErrors, ...rest }) => {
    let valid = true;

    // validate form errors being empty
    Object.values(formErrors).forEach(val => {
        val.length > 0 && (valid = false);
    });

    // validate the form was filled out
    Object.values(rest).forEach(val => {
        val === null && (valid = false);
    });

    return valid;
};

class Singin extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: "",
            ten: "",
            sdt: "",
            email: "",
            pass: "",
            pass_xacnhan: "",
            maxacthuc: "",
            maotp: "",
            redirect: 0,
            formErrors: {
                ten: "",
                sdt: "",
                email: "",
                pass: "",
                pass_xacnhan: ""
            }
        };
    }

    handleChange = e => {
        e.preventDefault();
        const { pass } = this.state;
        const { name, value } = e.target;
        let formErrors = { ...this.state.formErrors };

        switch (name) {
            case "ten":
                formErrors.ten =
                    value.length < 1 ? "Tên không được bỏ trống" : "";
                break;
            case "sdt":
                formErrors.sdt = sdtRegex.test(value)
                    ? ""
                    : "SDT có 10 chữ số; ví dụ: 0123456789"
                break;
            case "email":
                formErrors.email = emailRegex.test(value)
                    ? ""
                    : "Email không hợp lệ; ví dụ: abc@gmail.com";
                break;
            case "pass":
                formErrors.pass =
                    value.length < 8 ? "Mật khẩu phải từ 8 kí tự trở lên" : "";
                break;
            case "pass_xacnhan":
                formErrors.pass_xacnhan =
                    value != pass ? "Mật khẩu xác nhận không khớp" : "";
                break;
            default:
                break;
        }

        this.setState({ formErrors, [name]: value }, () => console.log(this.state));
    };


    updateMatKhau = (evt) => {
        evt.preventDefault();
        if (formValid(this.state)) {
            const { sdt, email, pass, id } = this.state;
            const config = {
                headers: {
                    "Content-Type": "application/json",
                },
            };
            const body = JSON.stringify({ sdt, email, pass, id });
            console.log("emaail:" + email);
            console.log("pass:" + pass);
            axios
                .post(ipConfigg + `/api/updateMatKhau`, body, config)
                .then((res) => {
                    if (res.data.msg == "true") {
                        Swal.fire(
                            'Cập nhật mật khẩu!',
                            'Bạn đã cập nhật mật khẩu thành công!!!',
                            'success'
                        )
                        this.setState({ redirect: 3 });
                    }
                    else if (res.data.msg != "true") {
                        Swal.fire(
                            'Lỗi',
                            'Vui lòng nhập lại !!!',
                            'error'
                        )
                    }
                });
        } else {
            console.log(this.state);
            return;
        }
    };
    senMail = (evt) => {
        evt.preventDefault();
        const { ten, sdt, email, pass, pass_xacnhan, maxacthuc } = this.state;
        const config = {
            headers: {
                "Content-Type": "application/json",
            },
        };
        const body = JSON.stringify({ ten, sdt, email, pass, pass_xacnhan, maxacthuc });
        axios
            .post(ipConfigg + `/api/send-email`, body, config)
            .then((res) => {
                if (res.data.msg != "false") {
                    this.maotp = res.data.msg;
                    ma_otp = res.data.msg + "";
                    this.redirect = 1;
                }
            })
    };
    xacThucTaiKhoan = (evt) => {
        evt.preventDefault();
        const { ten, sdt, email, pass, pass_xacnhan, maxacthuc, maotp } = this.state;
        const config = {
            headers: {
                "Content-Type": "application/json",
            },
        };
        const body = JSON.stringify({ ten, sdt, email, pass, pass_xacnhan, maxacthuc, maotp });
        console.log("maxacthuc" + maxacthuc);
        console.log("maotp" + ma_otp);
        if (maxacthuc == ma_otp) {
            Swal.fire(
                'Xác Thực!',
                'Bạn đã xác thực thành công.',
                'success'
            )
            this.setState({ redirect: 2 });
        }
        else {
            Swal.fire(
                'Xác Thực!',
                'Bạn đã xác thực thất bại.',
                'error'
            )
        }
    };


    handleSubmit = (evt) => {
        evt.preventDefault();
        const config = {
            headers: {
                "Content-Type": "application/json",
            },
        };
        const { email } = this.state;
        const body = JSON.stringify({ email });
        if (this.state.email != "") {
            if (formValid(this.state)) {

                const config = {
                    headers: {
                        "Content-Type": "application/json",
                    },
                };
                axios
                    .post(ipConfigg + `/api/kiemTraTrungEmail`, body, config)
                    .then((res) => {
                        if (res.data.msg == "true") {
                            Swal.fire(
                                'Xác Thực!',
                                'Mã xác thực đã gởi đến gmail của bạn!!!',
                                'success'
                            )
                            this.senMail(evt);
                            this.setState({ redirect: 1 });
                        }
                        else if (res.data.msg == "false") {
                            Swal.fire(
                                'Xác thực!',
                                'Không có tài khoản này',
                                'error'
                            )
                        }
                    })
            }
        }
        else {
            Swal.fire(
                'Lỗi!',
                'Không được để trống email!',
                'error'
            )
        }

    };

    render() {
        const { formErrors } = this.state;
        const { redirect } = this.state;
        if (redirect == 1) {
            return (
                <>
                    <div className="row justify-content-center">
                        <div className="col-lg-6 text-center">
                            <div className="card bg-light">
                                <article
                                    className="card-body mx-auto"
                                    style={{ maxWidth: "400px" }}
                                >
                                    <h4 className="card-title mt-3 text-center">
                                        Xác thực tài khoản
                                    </h4>
                                    <p className="text-center">
                                        Mã xác thực đã gởi về gmail của bạn
                                    </p>

                                    <form>
                                        <div className="form-group input-group">
                                            <div className="input-group-prepend">
                                                <span className="input-group-text">
                                                    <FontAwesomeIcon icon="user" />
                                                </span>
                                            </div>
                                            <input
                                                name="maxacthuc"
                                                className="form-control"
                                                placeholder="Nhập mã xác thực"
                                                type="text"
                                                onChange={this.handleChange}
                                                value={this.state.maxacthuc}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <button
                                                onClick={(evt) => this.xacThucTaiKhoan(evt)}
                                                type="submit"
                                                className="btn btn-primary btn-block"
                                            >
                                                {" "}
                                                Xác thực{" "}
                                            </button>
                                        </div>
                                    </form>
                                </article>
                            </div>
                        </div>
                    </div>
                    <Footer />
                </>
            );
        }
        else if (redirect == 2) {
            return (
                <>
                    <div className="row justify-content-center">
                        <div className="col-lg-6 text-center">
                            <div className="card bg-light">
                                <article
                                    className="card-body mx-auto"
                                    style={{ maxWidth: "400px" }}
                                >
                                    <h4 className="card-title mt-3 text-center">
                                        Cập nhật mật khẩu
                                    </h4>
                                    <p className="text-center">
                                        Để tham gia cùng OLAZ
                                    </p>

                                    <form>
                                        <div className="form-group input-group">
                                            <div className="input-group-prepend">
                                                <span className="input-group-text">
                                                    <FontAwesomeIcon icon="envelope" />
                                                </span>
                                            </div>
                                            <input
                                                name="email"
                                                className={formErrors.email.length > 0 ? "error" : null}
                                                className="form-control"
                                                placeholder="Nhập Email"
                                                type="email"
                                                onChange={this.handleChange}
                                                value={this.state.email}
                                            />
                                        </div>
                                        {formErrors.email.length > 0 && (
                                            <span style={{ fontSize: 12, color: "red" }} className="errorMessage">{formErrors.email}</span>
                                        )}
                                        <div className="form-group input-group">
                                            <div className="input-group-prepend">
                                                <span className="input-group-text">
                                                    <FontAwesomeIcon icon="lock" />
                                                </span>
                                            </div>
                                            <input
                                                name="pass"
                                                className={formErrors.pass.length > 0 ? "error" : null}
                                                className="form-control"
                                                placeholder="Nhập Mật Khẩu"
                                                type="password"
                                                onChange={this.handleChange}
                                                value={this.state.pass}
                                            />
                                        </div>
                                        {formErrors.pass.length > 0 && (
                                            <span style={{ fontSize: 12, color: "red" }} className="errorMessage">{formErrors.pass}</span>
                                        )}
                                        <div className="form-group input-group">
                                            <div className="input-group-prepend">
                                                <span className="input-group-text">
                                                    <FontAwesomeIcon icon="lock" />
                                                </span>
                                            </div>
                                            <input
                                                name="pass_xacnhan"
                                                className={formErrors.pass_xacnhan.length > 0 ? "error" : null}
                                                className="form-control"
                                                placeholder="Nhập Lại Mật Khẩu"
                                                type="password"
                                                onChange={this.handleChange}
                                                value={this.state.pass_xacnhan}
                                            />
                                        </div>
                                        {formErrors.pass_xacnhan.length > 0 && (
                                            <span style={{ fontSize: 12, color: "red" }} className="errorMessage">{formErrors.pass_xacnhan}</span>
                                        )}
                                        <div className="form-group">
                                            <button
                                                onClick={(evt) => this.updateMatKhau(evt)}
                                                type="submit"
                                                className="btn btn-primary btn-block"
                                            >
                                                {" "}
                                                Xác nhận{" "}
                                            </button>
                                        </div>
                                    </form>
                                </article>
                            </div>
                        </div>
                    </div>
                    <Footer />
                </>
            );
        }
        else if (redirect == 3) {
            return <Redirect to={'/dang-nhap'} />
        }
        return (
            <>
                <div className="row justify-content-center">
                    <div className="col-lg-6 text-center">
                        <div className="card bg-light">
                            <article
                                className="card-body mx-auto"
                                style={{ maxWidth: "400px" }}
                            >
                                <h4 className="card-title mt-3 text-center">
                                    Lấy lại mật khẩu
                                </h4>
                                <p className="text-center">
                                    Vui lòng chọn phương thức xác thực
                                </p>

                                <Tabs defaultActiveKey="email" id="uncontrolled-tab-example">
                                    <Tab eventKey="sdt" title="Bắt Đầu Bằng SDT">
                                        <form>
                                            <div className="form-group input-group">
                                                <div className="input-group-prepend">
                                                    <span className="input-group-text">
                                                        <FontAwesomeIcon icon="phone" />
                                                    </span>
                                                </div>
                                                <input
                                                    className={formErrors.sdt.length > 0 ? "error" : null}
                                                    name="sdt"
                                                    className="form-control"
                                                    placeholder="Nhập Số Điện Thoại"
                                                    type="text"
                                                    onChange={this.handleChange}
                                                    value={this.state.sdt}
                                                />
                                            </div>
                                            {formErrors.sdt.length > 0 && (
                                                <span style={{ fontSize: 12, color: "red" }} className="errorMessage">{formErrors.sdt}</span>
                                            )}
                                            <div className="form-group">
                                                <button
                                                    onClick={(evt) => this.handleSubmit(evt)}
                                                    type="submit"
                                                    className="btn btn-primary btn-block"
                                                >
                                                    {" "}
                                                    Tiếp Tục{" "}
                                                </button>
                                            </div>
                                            <p className="text-center">
                                                Bạn Đã Có Tài Khoản? <a href="/dang-nhap">Đăng Nhập</a>{" "}
                                            </p>
                                        </form>
                                    </Tab>
                                    <Tab eventKey="email" title="Bắt Đầu Bằng Email">
                                        <form>
                                            <div className="form-group input-group">
                                                <div className="input-group-prepend">
                                                    <span className="input-group-text">
                                                        <FontAwesomeIcon icon="envelope" />
                                                    </span>
                                                </div>
                                                <input
                                                    name="email"
                                                    className={formErrors.email.length > 0 ? "error" : null}
                                                    className="form-control"
                                                    placeholder="Nhập Email"
                                                    type="email"
                                                    onChange={this.handleChange}
                                                    value={this.state.email}
                                                />
                                            </div>
                                            {formErrors.email.length > 0 && (
                                                <span style={{ fontSize: 12, color: "red" }} className="errorMessage">{formErrors.email}</span>
                                            )}
                                            <div className="form-group">
                                                <button
                                                    onClick={(evt) => this.handleSubmit(evt)}
                                                    type="submit"
                                                    className="btn btn-primary btn-block"
                                                >
                                                    {" "}
                                                    Tiếp Tục{" "}
                                                </button>
                                            </div>
                                            <p className="text-center">
                                                Bạn Đã Có Tài Khoản? <a href="/dang-nhap">Đăng Nhập</a>{" "}
                                            </p>
                                        </form>
                                    </Tab>
                                </Tabs>
                            </article>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }
}
export default Singin;