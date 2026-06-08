import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaLeaf, FaHome, FaBuilding, FaSeedling, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { logout } from '../services/api';

function NavbarComponent() {
    const navigate = useNavigate();
    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('role');
    const username = localStorage.getItem('username');

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error(error);
        }
        localStorage.clear();
        navigate('/login');
    };

    return (
        <Navbar style={{ background: 'white', boxShadow: '0 2px 15px rgba(0,0,0,0.1)' }} expand="lg">
            <Container>
                {/* Лого */}
                <Navbar.Brand as={Link} to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                    <FaLeaf size={28} color="#2d5a27" />
                    <span style={{ fontWeight: 'bold', fontSize: '22px', color: '#2d5a27' }}>
                        GreenEstate
                    </span>
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    {token && (
                        <>
                            <Nav className="me-auto">
                                <Nav.Link
                                    as={Link}
                                    to="/"
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2d5a27', fontWeight: '500' }}
                                >
                                    <FaHome color="#2d5a27" /> Начало
                                </Nav.Link>
                                <Nav.Link
                                    as={Link}
                                    to="/properties"
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2d5a27', fontWeight: '500' }}
                                >
                                    <FaBuilding color="#2d5a27" /> Имоти
                                </Nav.Link>
                                <Nav.Link
                                    as={Link}
                                    to="/plants"
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2d5a27', fontWeight: '500' }}
                                >
                                    <FaSeedling color="#2d5a27" /> Растения
                                </Nav.Link>
                                {role === 'ADMIN' && (
                                    <Nav.Link
                                        as={Link}
                                        to="/admin"
                                        style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2d5a27', fontWeight: '500' }}
                                    >
                                        <FaCog color="#2d5a27" /> Администрация
                                    </Nav.Link>
                                )}
                            </Nav>

                            <Nav style={{ alignItems: 'center', gap: '10px' }}>
                                <span style={{ color: '#666', fontSize: '14px' }}>
                                    Здравей, <strong style={{ color: '#2d5a27' }}>{username}</strong>!
                                </span>
                                <Nav.Link as={Link} to="/profile" style={{ color: '#2d5a27', fontWeight: 600, fontSize: '14px', padding: '4px 12px', background: '#f0fdf4', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 5 }}>
                                    👤 Профил
                                </Nav.Link>
                                <Button
                                    onClick={handleLogout}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        background: '#2d5a27',
                                        border: 'none',
                                        borderRadius: '20px',
                                        padding: '6px 16px',
                                        fontSize: '14px'
                                    }}
                                    onMouseOver={e => e.currentTarget.style.background = '#1e3d1a'}
                                    onMouseOut={e => e.currentTarget.style.background = '#2d5a27'}
                                >
                                    <FaSignOutAlt /> Изход
                                </Button>
                            </Nav>
                        </>
                    )}
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default NavbarComponent;