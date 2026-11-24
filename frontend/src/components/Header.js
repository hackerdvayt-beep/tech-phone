import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { LinkContainer } from "react-router-bootstrap";
import { useHistory } from "react-router-dom";
import {
  Navbar,
  Nav,
  Container,
  NavDropdown,
  Form,
  Button,
} from "react-bootstrap";
import { logout } from "../actions/userActions";
import InputBar from "./InputBar";

const Header = () => {
  const [keyword, setKeyword] = useState("");
  const dispatch = useDispatch();
  const history = useHistory();
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const logoutHandler = () => {
    dispatch(logout());
  };

  const searchSubmitHandler = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      history.push(`/search/${keyword.trim()}`);
      setKeyword(""); // Clear search after submission
    }
  };

  return (
    <header>
      <Navbar
        bg="light"
        variant="light"
        expand="xl"
        collapseOnSelect
        className="custom-navbar"
      >
        <Container>
          {/* Logo */}
          <LinkContainer to="/">
            <Navbar.Brand className="text-dark fw-bold">
            TECH PHONE
            </Navbar.Brand>
          </LinkContainer>

          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            {/* Left side navigation items */}
            <Nav className="nav-main">
              <LinkContainer to="/products" st>
                <Nav.Link className="text-dark">Sản phẩm</Nav.Link>
              </LinkContainer>
              <LinkContainer to="/products?category=apple">
                <Nav.Link className="text-dark">Apple</Nav.Link>
              </LinkContainer>
              <LinkContainer to="/products?category=samsung">
                <Nav.Link className="text-dark">Samsung</Nav.Link>
              </LinkContainer>
              <LinkContainer to="/products?category=xiaomi">
                <Nav.Link className="text-dark">Xiaomi</Nav.Link>
              </LinkContainer>
              <LinkContainer to="/products?category=oppo">
                <Nav.Link className="text-dark">OPPO</Nav.Link>
              </LinkContainer>
              <LinkContainer to="/products?category=google">
                <Nav.Link className="text-dark">Google</Nav.Link>
              </LinkContainer>
              <LinkContainer to="/products?category=accessory">
                <Nav.Link className="text-dark">Phụ kiện</Nav.Link>
              </LinkContainer>
              <LinkContainer to="/products?category=sale-off">
                <Nav.Link className="text-dark">Giảm giá</Nav.Link>
              </LinkContainer>
              <LinkContainer to="/track-order">
                <Nav.Link className="text-dark">Tra cứu đơn</Nav.Link>
              </LinkContainer>
              <LinkContainer to="/trade-in">
                <Nav.Link className="text-dark">Thu cũ đổi mới</Nav.Link>
              </LinkContainer>
              <LinkContainer to="/compare">
                <Nav.Link className="text-dark">So sánh</Nav.Link>
              </LinkContainer>
            </Nav>

            {/* Right side - Search, Account, Cart */}
            <Nav className="d-flex align-items-center nav-utilities">
              {/* Search Bar */}
              <Form
                className="d-flex align-items-center me-3 d-none d-md-flex"
                onSubmit={searchSubmitHandler}
              >
                <InputBar
                  placeholder="Tìm kiếm..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  width="140px"
                  height="38px"
                  backgroundColor="#f8f9fa"
                  borderRadius="8px"
                  border="1px solid #ced4da"
                  style={{
                    marginBottom: "0",
                    marginRight: "8px",
                    minWidth: "150px",
                    maxWidth: "160px",
                  }}
                />
                <Button
                  type="submit"
                  style={{
                    height: "38px",
                    backgroundColor: "#ffffffff",
                    color: "black",
                    marginBottom: "4px",
                    paddingLeft: "0.4rem",
                  }}
                >
                  <i className="fas fa-search"></i>
                </Button>
              </Form>

              {/* Mobile Search Button */}
              <Nav.Link
                className="text-dark me-3 d-md-none"
                onClick={() => {
                  // You can implement a mobile search modal here
                  const searchTerm = prompt("Tìm kiếm sản phẩm:");
                  if (searchTerm && searchTerm.trim()) {
                    history.push(`/search/${searchTerm.trim()}`);
                  }
                }}
              >
                <i className="fas fa-search"></i>
              </Nav.Link>

              {/* Account */}
              {userInfo ? (
                <NavDropdown
                  title={
                    <span className="text-dark">
                      <i className="fas fa-user"></i> {userInfo.name}
                    </span>
                  }
                  id="username"
                  className="me-3"
                >
                  <LinkContainer to="/profile">
                    <NavDropdown.Item>Hồ sơ</NavDropdown.Item>
                  </LinkContainer>
                  {userInfo.isAdmin && (
                    <>
                      <NavDropdown.Divider />

                      <LinkContainer to="/admin/userlist">
                        <NavDropdown.Item>Quản lý người dùng</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/admin/productlist">
                        <NavDropdown.Item>Quản lý sản phẩm</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/admin/orderlist">
                        <NavDropdown.Item>Quản lý đơn hàng</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/admin/installment-requests">
                        <NavDropdown.Item>
                          Yêu cầu trả góp
                        </NavDropdown.Item>
                      </LinkContainer>
                      <NavDropdown.Divider />
                    </>
                  )}
                  <NavDropdown.Item onClick={logoutHandler}>
                    Đăng xuất
                  </NavDropdown.Item>
                </NavDropdown>
              ) : (
                <LinkContainer to="/login">
                  <Nav.Link className="text-dark me-3">
                    <i className="fas fa-user"></i>
                  </Nav.Link>
                </LinkContainer>
              )}

              {/* Cart */}
              <LinkContainer to="/cart">
                <Nav.Link className="text-dark">
                  <i className="fas fa-shopping-cart"></i>
                </Nav.Link>
              </LinkContainer>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Custom CSS */}
      <style jsx="true">{`
        .custom-navbar {
          background-color: white !important;
          border-bottom: 1px solid #dee2e6;
        }
        .custom-navbar .nav-main {
          flex-wrap: nowrap;
          align-items: center;
        }
        .custom-navbar .navbar-nav .nav-link {
          color: black !important;
          font-weight: 500;
          padding: 0.45rem 0.36rem;
          white-space: nowrap;
          font-size: 0.73rem;
          text-transform: uppercase;
        }
        .custom-navbar .navbar-nav .nav-link:hover {
          color: #495057 !important;
        }
        .custom-navbar .navbar-brand {
          color: black !important;
          font-size: 1.1rem;
          margin-right: 0.55rem;
          white-space: nowrap;
        }
        .dropdown-toggle::after {
          display: none;
        }

        /* Responsive improvements */
        @media (min-width: 1200px) {
          .custom-navbar > .container {
            flex-wrap: nowrap;
          }
          .custom-navbar .nav-main {
            flex: 1;
            justify-content: center;
          }
          .custom-navbar .nav-main .nav-link {
            padding-right: 0.28rem;
            padding-left: 0.28rem;
            font-size: 0.68rem;
          }
          .custom-navbar .navbar-collapse {
            min-width: 0;
          }
          .custom-navbar .nav-utilities {
            margin-left: auto;
            flex-shrink: 0;
          }
        }

        @media (max-width: 1199.98px) {
          .custom-navbar .navbar-nav .nav-link {
            padding: 0.5rem 0.75rem;
            font-size: 0.9rem;
          }
          .custom-navbar .navbar-nav .nav-link {
            white-space: nowrap;
          }
          .custom-navbar .navbar-brand {
            font-size: 1.25rem;
          }
        }

        @media (max-width: 575.98px) {
          .custom-navbar .navbar-brand {
            font-size: 1.1rem;
          }
        }
      `}</style>
    </header>
  );
};

export default Header;
